import os
from datetime import datetime, timedelta, timezone
from typing import Any, Dict

from jose import JWTError, jwt
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
ALGORITHM = "HS256"


def normalize_password(password: str) -> str:
    password_bytes = password.encode("utf-8")
    if len(password_bytes) > 72:
        return password_bytes[:72].decode("utf-8", errors="ignore")
    return password


def get_jwt_secret() -> str:
    return os.getenv("JWT_SECRET") or "development-only-change-me"


def hash_password(password: str) -> str:
    return pwd_context.hash(normalize_password(password))


def verify_password(password: str, password_hash: str) -> bool:
    return pwd_context.verify(normalize_password(password), password_hash)


def create_access_token(data: Dict[str, Any], expires_minutes: int = 60 * 24) -> str:
    payload = data.copy()
    payload["exp"] = datetime.now(timezone.utc) + timedelta(minutes=expires_minutes)
    return jwt.encode(payload, get_jwt_secret(), algorithm=ALGORITHM)


def decode_token(token: str) -> Dict[str, Any]:
    try:
        return jwt.decode(token, get_jwt_secret(), algorithms=[ALGORITHM])
    except JWTError as exc:
        raise ValueError("Invalid or expired token") from exc
