from fastapi import APIRouter

from schemas.prediction import PredictionRequest, PredictionResponse
from services.prediction import predict_risk

router = APIRouter(prefix="/api/prediction", tags=["Prediction"])


@router.post("", response_model=PredictionResponse, summary="Predict cyber risk without saving")
def predict(payload: PredictionRequest):
    result = predict_risk(payload.features)
    return {k: result[k] for k in ["risk_level", "cyber_trust_score", "future_risk_score", "confidence", "risk_factors", "recommendations"]}
