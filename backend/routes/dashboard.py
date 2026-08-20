from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

from database.collections import ASSESSMENTS, RECOMMENDATIONS, RISK_HISTORY, USERS
from database.connection import get_database
from utils.encoding import public_user
from utils.auth import current_user

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/me", summary="Get dashboard data for the authenticated user")
def get_my_dashboard(user=Depends(current_user)):
    return build_dashboard(user["id"])


@router.get("/{user_id}", summary="Get dashboard data")
def get_dashboard(user_id: str, user=Depends(current_user)):
    if user_id != user["id"]:
        raise HTTPException(status_code=403, detail="You cannot access another user's dashboard")
    return build_dashboard(user_id)


def build_dashboard(user_id: str):
    db = get_database()
    try:
        user = db[USERS].find_one({"_id": ObjectId(user_id)})
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid user id") from exc
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    latest = db[ASSESSMENTS].find_one({"user_id": user_id}, sort=[("created_at", -1)]) or {}
    history = list(db[RISK_HISTORY].find({"user_id": user_id}).sort("date", 1))
    recs = list(db[RECOMMENDATIONS].find({"user_id": user_id}).sort("created_at", -1))
    return {
        "user": public_user(user),
        "cyber_trust_score": latest.get("cyber_trust_score", 0),
        "risk_level": latest.get("risk_level", "Unknown"),
        "future_risk_score": latest.get("future_risk_score", 0),
        "risk_trend": [{"w": f"W{i+1}", "score": row.get("trust_score", 0)} for i, row in enumerate(history[-8:])],
        "history": [{"date": row.get("date").isoformat() if hasattr(row.get("date"), "isoformat") else str(row.get("date")), "trust_score": row.get("trust_score", 0), "future_risk_score": row.get("future_risk_score", 0), "risk_level": row.get("risk_level", "Unknown")} for row in history],
        "top_risk_factors": latest.get("risk_factors", [])[:5],
        "recommendations": [{**rec, "id": str(rec["_id"]), "_id": str(rec["_id"])} for rec in recs[:8]],
        "completed_recommendations": len([r for r in recs if r.get("completed")]),
        "security_category_status": latest.get("security_category_status", []),
        "recent_assessments": [{**row, "_id": str(row["_id"]), "id": str(row["_id"])} for row in db[ASSESSMENTS].find({"user_id": user_id}).sort("created_at", -1).limit(5)],
    }
