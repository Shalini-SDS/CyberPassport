from datetime import datetime, timezone
from uuid import uuid4

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

from database.collections import ASSESSMENTS, PASSPORTS, RECOMMENDATIONS, RISK_HISTORY, USERS
from database.connection import get_database
from schemas.assessment import AssessmentRequest, AssessmentResponse
from services.prediction import predict_risk
from utils.auth import current_user

router = APIRouter(prefix="/api/assessment", tags=["Assessment"])


@router.post("", response_model=AssessmentResponse, summary="Submit a cybersecurity assessment")
def submit_assessment(payload: AssessmentRequest, user=Depends(current_user)):
    db = get_database()
    payload.user_id = user["id"]
    try:
        user_oid = ObjectId(payload.user_id)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid user id") from exc
    if not db[USERS].find_one({"_id": user_oid}):
        raise HTTPException(status_code=404, detail="User not found")
    result = predict_risk(payload.features or {})
    now = datetime.now(timezone.utc)
    doc = {
        "user_id": payload.user_id,
        "profile": payload.profile,
        "answers": payload.answers,
        "features": result["features"],
        "risk_level": result["risk_level"],
        "cyber_trust_score": result["cyber_trust_score"],
        "future_risk_score": result["future_risk_score"],
        "confidence": result["confidence"],
        "risk_factors": result["risk_factors"],
        "recommendations": result["recommendations"],
        "security_category_status": result["security_category_status"],
        "passport_id": (db[PASSPORTS].find_one({"user_id": payload.user_id}) or {}).get("passport_id") or f"CP-{now.year}-{uuid4().hex[:8].upper()}",
        "created_at": now,
    }
    inserted = db[ASSESSMENTS].insert_one(doc)
    db[RISK_HISTORY].insert_one({
        "user_id": payload.user_id,
        "assessment_id": str(inserted.inserted_id),
        "date": now,
        "trust_score": doc["cyber_trust_score"],
        "future_risk_score": doc["future_risk_score"],
        "risk_level": doc["risk_level"],
    })
    rec_docs = [{**rec, "user_id": payload.user_id, "assessment_id": str(inserted.inserted_id), "created_at": now} for rec in result["recommendations"]]
    if rec_docs:
        db[RECOMMENDATIONS].insert_many(rec_docs)
    db[PASSPORTS].update_one({"user_id": payload.user_id}, {"$set": {"user_id": payload.user_id, "assessment_id": str(inserted.inserted_id), "passport_id": doc["passport_id"], "updated_at": now}}, upsert=True)
    return AssessmentResponse(assessment_id=str(inserted.inserted_id), **{k: doc[k] for k in ["risk_level", "cyber_trust_score", "future_risk_score", "confidence", "risk_factors", "recommendations", "security_category_status"]})
