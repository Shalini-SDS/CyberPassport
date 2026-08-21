import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.errors import DuplicateKeyError

from database.collections import AUTH_CODES, USERS
from database.connection import get_database
from schemas.user_profile import EmailCodeRequest, EmailVerification, PasswordChange, PasswordReset, PasswordResetRequest, TokenResponse, UserCreate, UserLogin
from utils.encoding import public_user
from utils.auth import current_user
from utils.security import create_access_token, hash_password, verify_password
from utils.email import send_email

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

CODE_TTL = timedelta(minutes=10)


def issue_code(db, email: str, purpose: str) -> str:
    code = f"{secrets.randbelow(1_000_000):06d}"
    now = datetime.now(timezone.utc)
    db[AUTH_CODES].delete_many({"email": email, "purpose": purpose})
    db[AUTH_CODES].insert_one({"email": email, "purpose": purpose, "code_hash": hash_password(code), "expires_at": now + CODE_TTL, "created_at": now})
    return code


def consume_code(db, email: str, code: str, purpose: str) -> bool:
    row = db[AUTH_CODES].find_one({"email": email, "purpose": purpose})
    expires_at = row.get("expires_at") if row else None
    if expires_at and expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if not row or not expires_at or expires_at < datetime.now(timezone.utc):
        return False
    if not verify_password(code, row.get("code_hash", "")):
        return False
    db[AUTH_CODES].delete_one({"_id": row["_id"]})
    return True


@router.post("/change-password", summary="Change the authenticated user's password")
def change_password(payload: PasswordChange, user=Depends(current_user)):
    if not verify_password(payload.current_password, user.get("password_hash", "")):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    get_database()[USERS].update_one({"_id": user["_id"]}, {"$set": {"password_hash": hash_password(payload.new_password), "updated_at": datetime.now(timezone.utc)}})
    return {"ok": True, "message": "Password changed successfully."}


@router.post("/register", status_code=status.HTTP_201_CREATED, summary="Register and email a verification code")
def register(payload: UserCreate):
    db = get_database()
    email = payload.email.lower()
    if db[USERS].find_one({"email": email}):
        raise HTTPException(status_code=409, detail="An account with this email already exists")
    user = {
        "name": payload.name,
        "email": email,
        "password_hash": hash_password(payload.password),
        "email_verified": False,
        "created_at": datetime.now(timezone.utc),
        "profile": {"name": payload.name, "email": email},
    }
    try:
        result = db[USERS].insert_one(user)
    except DuplicateKeyError as exc:
        raise HTTPException(status_code=409, detail="An account with this email already exists") from exc
    user["_id"] = result.inserted_id
    code = issue_code(db, email, "verify_email")
    try:
        send_email(email, "Verify your CyberPassport email", f"Your CyberPassport verification code is {code}. It expires in 10 minutes.")
    except RuntimeError:
        db[USERS].delete_one({"_id": result.inserted_id})
        raise HTTPException(status_code=503, detail="Email delivery is not configured") from None
    return {"message": "Verification code sent to your email."}


@router.post("/verify-email", response_model=TokenResponse, summary="Verify an email address")
def verify_email(payload: EmailVerification) -> TokenResponse:
    db = get_database()
    email = payload.email.lower()
    user = db[USERS].find_one({"email": email})
    if not user or not consume_code(db, email, payload.code, "verify_email"):
        raise HTTPException(status_code=400, detail="Invalid or expired verification code")
    db[USERS].update_one({"_id": user["_id"]}, {"$set": {"email_verified": True, "updated_at": datetime.now(timezone.utc)}})
    user["email_verified"] = True
    return TokenResponse(access_token=create_access_token({"sub": str(user["_id"]), "email": email}), user=public_user(user))


@router.post("/resend-verification", summary="Resend an email verification code")
def resend_verification(payload: EmailCodeRequest):
    email = payload.email.lower()
    db = get_database()
    user = db[USERS].find_one({"email": email, "email_verified": {"$ne": True}})
    if user:
        code = issue_code(db, email, "verify_email")
        try:
            send_email(email, "Verify your CyberPassport email", f"Your CyberPassport verification code is {code}. It expires in 10 minutes.")
        except RuntimeError:
            raise HTTPException(status_code=503, detail="Email delivery is not configured") from None
    return {"message": "If the account is awaiting verification, a new code has been sent."}


@router.post("/forgot-password", summary="Email a password reset code")
def forgot_password(payload: PasswordResetRequest):
    email = payload.email.lower()
    db = get_database()
    if db[USERS].find_one({"email": email}):
        code = issue_code(db, email, "reset_password")
        try:
            send_email(email, "Reset your CyberPassport password", f"Your CyberPassport password reset code is {code}. It expires in 10 minutes.")
        except RuntimeError:
            raise HTTPException(status_code=503, detail="Email delivery is not configured") from None
    return {"message": "If an account exists for that email, a reset code has been sent."}


@router.post("/reset-password", summary="Reset a password with an emailed code")
def reset_password(payload: PasswordReset):
    db = get_database()
    email = payload.email.lower()
    user = db[USERS].find_one({"email": email})
    if not user or not consume_code(db, email, payload.code, "reset_password"):
        raise HTTPException(status_code=400, detail="Invalid or expired reset code")
    db[USERS].update_one({"_id": user["_id"]}, {"$set": {"password_hash": hash_password(payload.new_password), "updated_at": datetime.now(timezone.utc)}})
    return {"message": "Password reset successfully."}


@router.post("/login", response_model=TokenResponse, summary="Login with email and password")
def login(payload: UserLogin) -> TokenResponse:
    db = get_database()
    user = db[USERS].find_one({"email": payload.email.lower()})
    if not user or not verify_password(payload.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if user.get("email_verified") is False:
        raise HTTPException(status_code=403, detail="Please verify your email before signing in")
    safe_user = public_user(user)
    token = create_access_token({"sub": str(user["_id"]), "email": user["email"]})
    return TokenResponse(access_token=token, user=safe_user)
