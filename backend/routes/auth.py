from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.errors import DuplicateKeyError

from database.collections import USERS
from database.connection import get_database
from schemas.user_profile import PasswordChange, TokenResponse, UserCreate, UserLogin
from utils.encoding import public_user
from utils.auth import current_user
from utils.security import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/change-password", summary="Change the authenticated user's password")
def change_password(payload: PasswordChange, user=Depends(current_user)):
    if not verify_password(payload.current_password, user.get("password_hash", "")):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    get_database()[USERS].update_one({"_id": user["_id"]}, {"$set": {"password_hash": hash_password(payload.new_password), "updated_at": datetime.now(timezone.utc)}})
    return {"ok": True, "message": "Password changed successfully."}


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED, summary="Register a user")
def register(payload: UserCreate) -> TokenResponse:
    db = get_database()
    user = {
        "name": payload.name,
        "email": payload.email.lower(),
        "password_hash": hash_password(payload.password),
        "created_at": datetime.now(timezone.utc),
        "profile": {"name": payload.name, "email": payload.email.lower()},
    }
    try:
        result = db[USERS].insert_one(user)
    except DuplicateKeyError as exc:
        raise HTTPException(status_code=409, detail="An account with this email already exists") from exc
    user["_id"] = result.inserted_id
    safe_user = public_user(user)
    token = create_access_token({"sub": str(result.inserted_id), "email": user["email"]})
    return TokenResponse(access_token=token, user=safe_user)


@router.post("/login", response_model=TokenResponse, summary="Login with email and password")
def login(payload: UserLogin) -> TokenResponse:
    db = get_database()
    user = db[USERS].find_one({"email": payload.email.lower()})
    if not user or not verify_password(payload.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    safe_user = public_user(user)
    token = create_access_token({"sub": str(user["_id"]), "email": user["email"]})
    return TokenResponse(access_token=token, user=safe_user)
