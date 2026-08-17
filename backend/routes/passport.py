from fastapi import APIRouter, HTTPException, Response

from database.connection import get_database
from services.passport import generate_passport_pdf, generate_passport_png, passport_by_identifier, verify_passport

router = APIRouter(prefix="/api/passport", tags=["Passport"])


@router.get("/verify/{passport_id}", summary="Verify a public CyberPassport")
def verify_public_passport(passport_id: str):
    db = get_database()
    return verify_passport(db, passport_id)


@router.get("/{identifier}", summary="Get current CyberPassport")
def get_passport(identifier: str):
    try:
        return passport_by_identifier(get_database(), identifier)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/{identifier}/download", summary="Download current CyberPassport PDF")
def download_passport(identifier: str):
    passport = get_passport(identifier)
    pdf = generate_passport_pdf(passport)
    return Response(
        content=pdf,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={passport['passport_id']}.pdf"},
    )


@router.get("/{identifier}/pdf", summary="Download current CyberPassport PDF")
def download_passport_pdf(identifier: str):
    return download_passport(identifier)


@router.get("/{identifier}/image", summary="Download current CyberPassport PNG")
def download_passport_image(identifier: str):
    passport = get_passport(identifier)
    png = generate_passport_png(passport)
    return Response(
        content=png,
        media_type="image/png",
        headers={"Content-Disposition": f"attachment; filename={passport['passport_id']}.png"},
    )
