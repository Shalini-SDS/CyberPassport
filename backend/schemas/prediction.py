from typing import Any, Dict

from pydantic import BaseModel


class PredictionRequest(BaseModel):
    features: Dict[str, Any]


class PredictionResponse(BaseModel):
    risk_level: str
    cyber_trust_score: int
    future_risk_score: int
    confidence: float
    risk_factors: list
    recommendations: list
