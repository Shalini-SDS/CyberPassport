from functools import lru_cache
from pathlib import Path
from typing import Any, Dict

import joblib
import numpy as np
import pandas as pd

from services.recommendation import build_recommendations
from services.risk_analysis import analyze_risk_factors
from services.trust_score import (
    calculate_future_risk_score,
    calculate_trust_score,
    category_status,
    normalize_features,
    risk_from_score,
)

MODEL_DIR = Path(__file__).resolve().parents[1] / "models"
MODEL_FILE = MODEL_DIR / "xgboost_final_model.pkl"
FEATURE_ENCODERS_FILE = MODEL_DIR / "feature_encoders.pkl"
TARGET_ENCODER_FILE = MODEL_DIR / "target_encoder.pkl"


class PredictionService:
    def __init__(self) -> None:
        self.model = joblib.load(MODEL_FILE)
        self.feature_encoders = joblib.load(FEATURE_ENCODERS_FILE)
        self.target_encoder = joblib.load(TARGET_ENCODER_FILE)
        self.feature_order = list(getattr(self.model, "feature_names_in_", [])) or list(self.feature_encoders.keys()) + ["cyber_trust_score", "future_risk_score"]

    def validate_and_encode(self, features: Dict[str, Any]) -> pd.DataFrame:
        normalized = normalize_features(features)
        trust_score = int(features.get("cyber_trust_score") or calculate_trust_score(normalized))
        future_risk_score = int(features.get("future_risk_score") or calculate_future_risk_score(normalized, trust_score))
        row: Dict[str, Any] = {}
        invalid: list[str] = []
        for field in self.feature_order:
            if field == "cyber_trust_score":
                row[field] = trust_score
                continue
            if field == "future_risk_score":
                row[field] = future_risk_score
                continue
            encoder = self.feature_encoders[field]
            value = normalized.get(field)
            if value not in set(map(str, encoder.classes_)):
                invalid.append(f"{field}={value!r}")
                value = str(encoder.classes_[0])
            row[field] = int(encoder.transform([value])[0])
        if invalid:
            raise ValueError("Invalid categorical values: " + ", ".join(invalid))
        return pd.DataFrame([row], columns=self.feature_order)

    def predict(self, features: Dict[str, Any]) -> Dict[str, Any]:
        normalized = normalize_features(features)
        trust_score = calculate_trust_score(normalized)
        future_risk_score = calculate_future_risk_score(normalized, trust_score)
        encoded = self.validate_and_encode({**normalized, "cyber_trust_score": trust_score, "future_risk_score": future_risk_score})
        pred = self.model.predict(encoded)[0]
        risk_level = str(self.target_encoder.inverse_transform([int(pred)])[0])
        if risk_level not in {"Low", "Medium", "High"}:
            risk_level = risk_from_score(trust_score)
        confidence = 0.0
        if hasattr(self.model, "predict_proba"):
            probabilities = self.model.predict_proba(encoded)[0]
            confidence = float(np.max(probabilities))
        return {
            "risk_level": risk_level,
            "cyber_trust_score": trust_score,
            "future_risk_score": future_risk_score,
            "confidence": round(confidence, 4),
            "risk_factors": analyze_risk_factors(normalized),
            "recommendations": build_recommendations(normalized),
            "security_category_status": category_status(normalized),
            "features": normalized,
            "model_file": MODEL_FILE.name,
            "feature_order": self.feature_order,
        }


@lru_cache
def get_prediction_service() -> PredictionService:
    return PredictionService()


def predict_risk(features: Dict[str, Any]) -> Dict[str, Any]:
    return get_prediction_service().predict(features)
