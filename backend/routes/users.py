from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, HTTPException
from pymongo import ReturnDocument

from database.collections import USERS
from database.connection import get_database
from schemas.user_profile import PasswordChange, UserProfileUpdate
from utils.encoding import public_user
from utils.security import hash_password, verify_password

router = APIRouter(prefix="/api/users", tags=["Users"])


def oid(user_id: str) -> ObjectId:
    try:
        return ObjectId(user_id)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid user id") from exc


@router.get("/{user_id}", summary="Get user profile")
def get_user(user_id: str):
    user = get_database()[USERS].find_one({"_id": oid(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return public_user(user)


@router.put("/{user_id}", summary="Update user profile")
def update_user(user_id: str, payload: UserProfileUpdate):
    db = get_database()
    updates = {k: v for k, v in payload.model_dump(exclude_unset=True).items() if v is not None}
    if "email" in updates:
        updates["email"] = str(updates["email"]).lower()
    update_doc = {f"profile.{k}": v for k, v in updates.items() if k not in {"email"}}
    if "email" in updates:
        update_doc["email"] = updates["email"]
        update_doc["profile.email"] = updates["email"]
    if "name" in updates:
        update_doc["name"] = updates["name"]
    update_doc["updated_at"] = datetime.now(timezone.utc)
    result = db[USERS].find_one_and_update({"_id": oid(user_id)}, {"$set": update_doc}, return_document=ReturnDocument.AFTER)
    if not result:
        raise HTTPException(status_code=404, detail="User not found")
    return public_user(result)


@router.patch("/{user_id}/password", summary="Change user password")
def change_password(user_id: str, payload: PasswordChange):
    db = get_database()
    user = db[USERS].find_one({"_id": oid(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not verify_password(payload.current_password, user.get("password_hash", "")):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    db[USERS].update_one({"_id": oid(user_id)}, {"$set": {"password_hash": hash_password(payload.new_password)}})
    return {"ok": True}
