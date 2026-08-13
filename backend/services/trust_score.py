from typing import Any, Dict, Optional

FEATURE_DEFAULTS: Dict[str, str] = {
    "occupation_category": "IT Professional",
    "password_management": "Password Manager",
    "password_change_frequency": "Every 3 Months",
    "password_length": "16+",
    "mfa_type": "Authenticator App",
    "mfa_coverage": "Most",
    "device_encryption": "Verified",
    "os_update_status": "Auto Updates",
    "vpn_usage": "Sometimes",
    "public_wifi_usage": "Protected Only",
    "auto_connect_disabled": "Always",
    "phishing_detection": "Usually",
    "security_training": "Within 12 Months",
    "https_awareness": "Usually",
    "breach_exposure": "Never",
    "antivirus_status": "Basic OS Protection",
    "login_monitoring": "Monthly",
    "backup_frequency": "Automatic",
    "browser_password_storage": "Password Manager",
    "software_source": "Official Store",
    "account_alerts_enabled": "Yes",
    "cloud_backup_enabled": "Yes",
    "social_media_privacy": "Moderate",
    "shared_device_usage": "Never",
    "email_security_level": "Advanced",
    "past_phishing_clicks": "0",
}

FIELD_WEIGHTS = {
    "password_management": {"Password Manager": 10, "Remember All": 5, "Written Notes": 2, "Same Password": 0},
    "password_change_frequency": {"Every 3 Months": 10, "Every 6 Months": 8, "When Breach Detected": 7, "Only When Forced": 3, "Rarely/Never": 0},
    "password_length": {"16+": 10, "12-15": 8, "8-11": 3, "Under 8": 0},
    "mfa_type": {"Hardware Key": 10, "Authenticator App": 9, "SMS Only": 5, "No MFA": 0},
    "mfa_coverage": {"All": 10, "Most": 7, "Some": 3, "Few/None": 0},
    "device_encryption": {"Verified": 10, "Believe So": 7, "Unsure": 2, "No": 0},
    "os_update_status": {"Auto Updates": 10, "Within 30 Days": 8, "Within 6 Months": 3, "Rarely Updated": 0},
    "vpn_usage": {"Always": 10, "Sometimes": 6, "Rarely": 2, "Never": 0},
    "public_wifi_usage": {"Never": 10, "Protected Only": 9, "Occasionally Unprotected": 3, "Frequently Unprotected": 0},
    "auto_connect_disabled": {"Always": 10, "Sometimes": 5, "Never": 0},
    "phishing_detection": {"Always": 10, "Usually": 7, "Sometimes Unsure": 3, "Often Unsure": 0},
    "security_training": {"Within 12 Months": 10, "1-3 Years Ago": 6, "Never": 0},
    "https_awareness": {"Always": 10, "Usually": 7, "Sometimes": 3, "Never": 0},
    "breach_exposure": {"Never": 10, "Once": 7, "2-5 Times": 3, "More Than 5 Times": 0},
    "antivirus_status": {"Enterprise": 10, "Consumer": 8, "Basic OS Protection": 7},
    "login_monitoring": {"Monthly": 10, "Few Months": 7, "Rarely": 3, "Never": 0},
    "backup_frequency": {"Automatic": 10, "Monthly": 7, "Occasionally": 4, "Never": 0},
    "browser_password_storage": {"Password Manager": 10, "Browser Storage": 3},
    "software_source": {"Official Store": 10, "Verified Website": 8, "Unknown Sources": 0},
    "account_alerts_enabled": {"Yes": 10, "No": 0},
    "cloud_backup_enabled": {"Yes": 10, "No": 0},
    "social_media_privacy": {"Strict": 10, "Moderate": 6, "Public": 1},
    "shared_device_usage": {"Never": 10, "Sometimes": 5, "Frequently": 0},
    "email_security_level": {"Advanced": 10, "Basic": 5, "Weak": 0},
    "past_phishing_clicks": {"0": 10, "1": 6, "2-5": 2, "5+": 0},
}


def normalize_features(features: Dict[str, Any]) -> Dict[str, str]:
    normalized = dict(FEATURE_DEFAULTS)
    for key, value in features.items():
        if value is not None and value != "":
            normalized[key] = str(value)
    return normalized


def calculate_trust_score(features: Dict[str, Any]) -> int:
    normalized = normalize_features(features)
    total = sum(FIELD_WEIGHTS.get(field, {}).get(normalized.get(field), 0) for field in FIELD_WEIGHTS)
    possible = len(FIELD_WEIGHTS) * 10
    return max(0, min(100, round((total / possible) * 100)))


def calculate_future_risk_score(features: Dict[str, Any], trust_score: Optional[int] = None) -> int:
    normalized = normalize_features(features)
    score = 100 - (trust_score if trust_score is not None else calculate_trust_score(normalized))
    if normalized["breach_exposure"] in {"2-5 Times", "More Than 5 Times"}:
        score += 8
    if normalized["past_phishing_clicks"] in {"2-5", "5+"}:
        score += 10
    if normalized["software_source"] == "Unknown Sources":
        score += 7
    if normalized["mfa_type"] == "No MFA":
        score += 8
    return max(0, min(100, round(score)))


def risk_from_score(score: int) -> str:
    if score >= 75:
        return "Low"
    if score >= 45:
        return "Medium"
    return "High"


def category_status(features: Dict[str, Any]) -> list[dict]:
    normalized = normalize_features(features)
    groups = {
        "Password Security": ["password_management", "password_change_frequency", "password_length", "browser_password_storage"],
        "MFA": ["mfa_type", "mfa_coverage"],
        "Device Security": ["device_encryption", "os_update_status", "antivirus_status", "software_source"],
        "Network Security": ["vpn_usage", "public_wifi_usage", "auto_connect_disabled"],
        "Phishing Protection": ["phishing_detection", "security_training", "https_awareness", "past_phishing_clicks"],
        "Backup & Recovery": ["backup_frequency", "cloud_backup_enabled"],
        "Privacy": ["social_media_privacy", "shared_device_usage", "account_alerts_enabled", "email_security_level"],
    }
    statuses = []
    for category, fields in groups.items():
        subtotal = sum(FIELD_WEIGHTS.get(field, {}).get(normalized.get(field), 0) for field in fields)
        pct = round((subtotal / (len(fields) * 10)) * 100)
        statuses.append({"label": category, "score": pct, "status": "good" if pct >= 75 else "fair" if pct >= 45 else "risk"})
    return statuses
