from bson import ObjectId
from fastapi import APIRouter, HTTPException
from pymongo import ReturnDocument

from database.collections import RECOMMENDATIONS
from database.connection import get_database
from utils.encoding import mongo_doc

router = APIRouter(prefix="/api/recommendations", tags=["Recommendations"])


@router.get("/{user_id}", summary="List persisted recommendations")
def list_recommendations(user_id: str):
    rows = list(get_database()[RECOMMENDATIONS].find({"user_id": user_id}).sort("created_at", -1))
    return [mongo_doc(row) for row in rows]


@router.patch("/{recommendation_id}", summary="Mark recommendation completed or uncompleted")
def update_recommendation(recommendation_id: str, payload: dict):
    try:
        rec_id = ObjectId(recommendation_id)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid recommendation id") from exc
    completed = bool(payload.get("completed"))
    row = get_database()[RECOMMENDATIONS].find_one_and_update({"_id": rec_id}, {"$set": {"completed": completed}}, return_document=ReturnDocument.AFTER)
    if not row:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    return mongo_doc(row)
