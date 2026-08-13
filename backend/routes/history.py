from fastapi import APIRouter

from database.collections import RISK_HISTORY
from database.connection import get_database

router = APIRouter(prefix="/api/history", tags=["History"])


@router.get("/{user_id}", summary="Get risk history")
def get_history(user_id: str):
    rows = list(get_database()[RISK_HISTORY].find({"user_id": user_id}).sort("date", 1))
    return [{
        "date": row["date"].isoformat() if hasattr(row.get("date"), "isoformat") else str(row.get("date")),
        "trust_score": row.get("trust_score", 0),
        "future_risk_score": row.get("future_risk_score", 0),
        "risk_level": row.get("risk_level", "Unknown"),
    } for row in rows]
