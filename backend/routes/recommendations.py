from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException
from pymongo import ReturnDocument

from database.collections import RECOMMENDATIONS
from database.connection import get_database
from utils.encoding import mongo_doc
from utils.auth import current_user

router = APIRouter(prefix="/api/recommendations", tags=["Recommendations"])


@router.get("/me", summary="List recommendations for the authenticated user")
def list_my_recommendations(user=Depends(current_user)):
    rows = list(get_database()[RECOMMENDATIONS].find({"user_id": user["id"]}).sort("created_at", -1))
    return [mongo_doc(row) for row in rows]


@router.get("/{user_id}", summary="List persisted recommendations")
def list_recommendations(user_id: str, user=Depends(current_user)):
    if user_id != user["id"]:
        raise HTTPException(status_code=403, detail="You cannot access another user's recommendations")
    rows = list(get_database()[RECOMMENDATIONS].find({"user_id": user_id}).sort("created_at", -1))
    return [mongo_doc(row) for row in rows]


@router.patch("/{recommendation_id}", summary="Mark recommendation completed or uncompleted")
def update_recommendation(recommendation_id: str, payload: dict, user=Depends(current_user)):
    try:
        rec_id = ObjectId(recommendation_id)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid recommendation id") from exc
    completed = bool(payload.get("completed"))
    row = get_database()[RECOMMENDATIONS].find_one_and_update({"_id": rec_id, "user_id": user["id"]}, {"$set": {"completed": completed}}, return_document=ReturnDocument.AFTER)
    if not row:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    return mongo_doc(row)
