from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class AssessmentRequest(BaseModel):
    user_id: str
    profile: Dict[str, Any] = Field(default_factory=dict)
    answers: Optional[Dict[str, List[int]]] = None
    features: Optional[Dict[str, Any]] = None


class AssessmentResponse(BaseModel):
    assessment_id: str
    risk_level: str
    cyber_trust_score: int
    future_risk_score: int
    confidence: float
    risk_factors: list
    recommendations: list
    security_category_status: list
