from bson import ObjectId
from fastapi import APIRouter, HTTPException, Response

from database.collections import ASSESSMENTS, USERS
from database.connection import get_database
from services.passport import build_passport, generate_passport_pdf

router = APIRouter(prefix="/api/passport", tags=["Passport"])


@router.get("/{user_id}", summary="Get current CyberPassport")
def get_passport(user_id: str):
    db = get_database()
    try:
        user = db[USERS].find_one({"_id": ObjectId(user_id)})
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid user id") from exc
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    assessment = db[ASSESSMENTS].find_one({"user_id": user_id}, sort=[("created_at", -1)])
    user["id"] = str(user["_id"])
    if assessment:
        assessment["id"] = str(assessment["_id"])
    return build_passport(user, assessment)


@router.get("/{user_id}/download", summary="Download current CyberPassport PDF")
def download_passport(user_id: str):
    passport = get_passport(user_id)
    pdf = generate_passport_pdf(passport)
    return Response(
        content=pdf,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={passport['passport_id']}.pdf"},
    )
