from pydantic import BaseModel, Field


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