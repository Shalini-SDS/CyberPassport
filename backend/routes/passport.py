from fastapi import APIRouter, Depends, HTTPException, Response
from bson import ObjectId

from database.connection import get_database
from services.passport import generate_passport_pdf, generate_passport_png, passport_by_identifier, verify_passport
from utils.auth import current_user

router = APIRouter(prefix="/api/passport", tags=["Passport"])


@router.get("/me", summary="Get the authenticated user's CyberPassport")
def get_my_passport(user=Depends(current_user)):
    return passport_by_identifier(get_database(), user["id"])


@router.get("/me/download", summary="Download the authenticated user's CyberPassport PDF")
def download_my_passport(user=Depends(current_user)):
    passport = passport_by_identifier(get_database(), user["id"])
    return Response(content=generate_passport_pdf(passport), media_type="application/pdf", headers={"Content-Disposition": f"attachment; filename={passport['passport_id']}.pdf"})


@router.get("/me/image", summary="Download the authenticated user's CyberPassport PNG")
def download_my_passport_image(user=Depends(current_user)):
    passport = passport_by_identifier(get_database(), user["id"])
    return Response(content=generate_passport_png(passport), media_type="image/png", headers={"Content-Disposition": f"attachment; filename={passport['passport_id']}.png"})


@router.get("/verify/{passport_id}", summary="Verify a public CyberPassport")
def verify_public_passport(passport_id: str):
    db = get_database()
    return verify_passport(db, passport_id)


@router.get("/{identifier}", summary="Get current CyberPassport")
def get_passport(identifier: str, user=Depends(current_user)):
    try:
        if ObjectId.is_valid(identifier) and identifier != user["id"]:
            raise HTTPException(status_code=403, detail="You cannot access another user's passport")
        passport = passport_by_identifier(get_database(), identifier)
        if passport.get("user_id") != user["id"]:
            raise HTTPException(status_code=403, detail="You cannot access another user's passport")
        return passport
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/{identifier}/download", summary="Download current CyberPassport PDF")
def download_passport(identifier: str, user=Depends(current_user)):
    passport = get_passport(identifier, user)
    pdf = generate_passport_pdf(passport)
    return Response(
        content=pdf,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={passport['passport_id']}.pdf"},
    )


@router.get("/{identifier}/pdf", summary="Download current CyberPassport PDF")
def download_passport_pdf(identifier: str, user=Depends(current_user)):
    return download_passport(identifier, user)


@router.get("/{identifier}/image", summary="Download current CyberPassport PNG")
def download_passport_image(identifier: str, user=Depends(current_user)):
    passport = get_passport(identifier, user)
    png = generate_passport_png(passport)
    return Response(
        content=png,
        media_type="image/png",
        headers={"Content-Disposition": f"attachment; filename={passport['passport_id']}.png"},
    )
