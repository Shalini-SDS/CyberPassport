import json
from io import BytesIO
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from PIL import Image, UnidentifiedImageError
from pymongo import ReturnDocument

from database.collections import ASSESSMENTS, PASSPORTS, RECOMMENDATIONS, RISK_HISTORY, USERS
from database.connection import get_database
from schemas.user_profile import NotificationPreferences, PrivacyPreferences, UserProfileUpdate
from utils.auth import current_user
from utils.encoding import public_user

router = APIRouter(prefix="/api/users", tags=["Users"])
UPLOAD_DIR = Path(__file__).resolve().parent.parent / "uploads"
ALLOWED_TYPES = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp"}
MAX_IMAGE_BYTES = 5 * 1024 * 1024


def me_document(user):
    result = public_user(user) or {}
    profile = result.get("profile", {}) or {}
    result["profile"] = profile
    result["profile_photo_url"] = profile.get("profile_photo_url", "")
    passport = get_database()[PASSPORTS].find_one({"user_id": result["id"]}) or {}
    latest = get_database()[ASSESSMENTS].find_one({"user_id": result["id"]}, sort=[("created_at", -1)]) or {}
    result["passport_id"] = passport.get("passport_id", "")
    result["trust_score"] = latest.get("cyber_trust_score", 0)
    result["risk_level"] = latest.get("risk_level", "Unknown")
    return result


@router.get("/me", summary="Get the authenticated user's profile")
def get_me(user=Depends(current_user)):
    return me_document(user)


@router.patch("/me", summary="Update the authenticated user's profile")
@router.put("/me")
def update_me(payload: UserProfileUpdate, user=Depends(current_user)):
    db = get_database()
    updates = {key: value for key, value in payload.model_dump(exclude_unset=True).items() if value is not None}
    if "email" in updates:
        updates["email"] = str(updates["email"]).lower()
        if db[USERS].find_one({"email": updates["email"], "_id": {"$ne": user["_id"]}}):
            raise HTTPException(status_code=409, detail="An account with this email already exists")
    update_doc = {f"profile.{key}": value for key, value in updates.items() if key not in {"name", "email"}}
    if "name" in updates:
        update_doc["name"] = updates["name"]
        update_doc["profile.name"] = updates["name"]
    if "email" in updates:
        update_doc["email"] = updates["email"]
        update_doc["profile.email"] = updates["email"]
    update_doc["updated_at"] = datetime.now(timezone.utc)
    result = db[USERS].find_one_and_update({"_id": user["_id"]}, {"$set": update_doc}, return_document=ReturnDocument.AFTER)
    return me_document(result)


@router.post("/me/photo", summary="Upload or replace the authenticated user's profile photo")
async def upload_photo(file: UploadFile = File(...), user=Depends(current_user)):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Please upload a valid JPG, PNG or WebP image.")
    content = await file.read()
    if len(content) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=413, detail="Image size is too large.")
    try:
        with Image.open(BytesIO(content)) as image:
            image.verify()
    except (UnidentifiedImageError, OSError) as exc:
        raise HTTPException(status_code=400, detail="Please upload a valid JPG, PNG or WebP image.") from exc
    UPLOAD_DIR.mkdir(exist_ok=True)
    target = UPLOAD_DIR / f"{user['id']}-{uuid4().hex}{ALLOWED_TYPES[file.content_type]}"
    for old in UPLOAD_DIR.glob(f"{user['id']}.*"):
        if old != target:
            old.unlink(missing_ok=True)
    target.write_bytes(content)
    url = f"/uploads/{target.name}"
    result = get_database()[USERS].find_one_and_update({"_id": user["_id"]}, {"$set": {"profile.profile_photo_url": url, "updated_at": datetime.now(timezone.utc)}}, return_document=ReturnDocument.AFTER)
    return {"profile_photo_url": url, "user": me_document(result)}


@router.get("/me/notifications")
def get_notifications(user=Depends(current_user)):
    return user.get("preferences", {}).get("notifications", NotificationPreferences().model_dump())


@router.patch("/me/notifications")
def update_notifications(payload: NotificationPreferences, user=Depends(current_user)):
    values = payload.model_dump()
    get_database()[USERS].update_one({"_id": user["_id"]}, {"$set": {"preferences.notifications": values}})
    return values


@router.get("/me/privacy")
def get_privacy(user=Depends(current_user)):
    return user.get("preferences", {}).get("privacy", PrivacyPreferences().model_dump())


@router.patch("/me/privacy")
def update_privacy(payload: PrivacyPreferences, user=Depends(current_user)):
    values = payload.model_dump()
    get_database()[USERS].update_one({"_id": user["_id"]}, {"$set": {"preferences.privacy": values}})
    return values


@router.get("/me/export")
def export_data(user=Depends(current_user)):
    db = get_database()
    user_id = user["id"]
    data = {
        "profile": me_document(user),
        "assessments": list(db[ASSESSMENTS].find({"user_id": user_id}, {"_id": 0, "user_id": 0})),
        "risk_history": list(db[RISK_HISTORY].find({"user_id": user_id}, {"_id": 0, "user_id": 0})),
        "recommendations": list(db[RECOMMENDATIONS].find({"user_id": user_id}, {"_id": 0, "user_id": 0})),
        "passport": db[PASSPORTS].find_one({"user_id": user_id}, {"_id": 0, "user_id": 0}),
        "preferences": user.get("preferences", {}),
    }
    return json.loads(json.dumps(data, default=str))


@router.delete("/me")
def delete_me(user=Depends(current_user)):
    db = get_database()
    user_id = user["id"]
    for collection in (ASSESSMENTS, RISK_HISTORY, RECOMMENDATIONS, PASSPORTS):
        db[collection].delete_many({"user_id": user_id})
    for photo in [*UPLOAD_DIR.glob(f"{user_id}.*"), *UPLOAD_DIR.glob(f"{user_id}-*")]:
        photo.unlink(missing_ok=True)
    db[USERS].delete_one({"_id": user["_id"]})
    return {"ok": True, "message": "Your account has been deleted."}


