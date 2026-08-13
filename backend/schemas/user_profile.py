from typing import Any, Dict, Optional

from pydantic import BaseModel, EmailStr, Field, field_validator


class UserProfile(BaseModel):

    occupation_category: str

    password_management: str
    password_change_frequency: str
    password_length: str

    mfa_type: str
    mfa_coverage: str

    device_encryption: str
    os_update_status: str
    vpn_usage: str
    public_wifi_usage: str
    auto_connect_disabled: str

    phishing_detection: str
    security_training: str
    https_awareness: str

    breach_exposure: str
    antivirus_status: str
    login_monitoring: str
    backup_frequency: str

    browser_password_storage: str
    software_source: str

    account_alerts_enabled: str
    cloud_backup_enabled: str

    social_media_privacy: str
    shared_device_usage: str

    email_security_level: str

    past_phishing_clicks: int = Field(
        default=0,
        ge=0
    )


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        if len(value.encode("utf-8")) > 72:
            raise ValueError("Password must be 72 bytes or fewer")
        return value


class UserLogin(BaseModel):
    email: EmailStr
    password: str

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        if len(value.encode("utf-8")) > 72:
            raise ValueError("Password must be 72 bytes or fewer")
        return value


class TokenResponse(BaseModel):
    access_token: str
    user: Dict[str, Any]


class PasswordChange(BaseModel):
    current_password: str
    new_password: str


class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    occupation: Optional[str] = None
    country: Optional[str] = None
    phone: Optional[str] = None
    linkedin: Optional[str] = None
    bio: Optional[str] = None
    dob: Optional[str] = None
    gender: Optional[str] = None
