import numpy as np


def calculate_trust_score(row):
    """
    Calculate Cyber Trust Score from a user's cybersecurity profile.

    Expected input:
        Dictionary-like object containing cybersecurity features.

    Returns:
        Integer score between 1 and 100.
    """

    score = 40

    # ---------------------------------------------------------
    # Password Management
    # ---------------------------------------------------------
    if row.get("password_management") == "Password Manager":
        score += 8
    elif row.get("password_management") == "Remember All":
        score += 4
    elif row.get("password_management") == "Written Notes":
        score -= 4
    else:
        score -= 8

    # ---------------------------------------------------------
    # MFA
    # ---------------------------------------------------------
    if row.get("mfa_type") == "Hardware Key":
        score += 8
    elif row.get("mfa_type") == "Authenticator App":
        score += 6
    elif row.get("mfa_type") == "SMS Only":
        score += 2
    else:
        score -= 8

    # ---------------------------------------------------------
    # Device Encryption
    # ---------------------------------------------------------
    if row.get("device_encryption") == "Verified":
        score += 5
    elif row.get("device_encryption") == "Believe So":
        score += 2
    elif row.get("device_encryption") == "Unsure":
        score -= 2
    else:
        score -= 6

    # ---------------------------------------------------------
    # OS Updates
    # ---------------------------------------------------------
    if row.get("os_update_status") == "Auto Updates":
        score += 5
    elif row.get("os_update_status") == "Within 30 Days":
        score += 3
    elif row.get("os_update_status") == "Within 6 Months":
        score -= 3
    else:
        score -= 6

    # ---------------------------------------------------------
    # VPN Usage
    # ---------------------------------------------------------
    if row.get("vpn_usage") == "Always":
        score += 4
    elif row.get("vpn_usage") == "Sometimes":
        score += 2
    elif row.get("vpn_usage") == "Rarely":
        score -= 2
    else:
        score -= 4

    # ---------------------------------------------------------
    # Public WiFi
    # ---------------------------------------------------------
    if row.get("public_wifi_usage") == "Frequently Unprotected":
        score -= 8
    elif row.get("public_wifi_usage") == "Occasionally Unprotected":
        score -= 4

    # ---------------------------------------------------------
    # Breach Exposure
    # ---------------------------------------------------------
    if row.get("breach_exposure") == "Never":
        score += 5
    elif row.get("breach_exposure") == "Once":
        score += 1
    elif row.get("breach_exposure") == "2-5 Times":
        score -= 4
    else:
        score -= 8

    # ---------------------------------------------------------
    # Antivirus
    # ---------------------------------------------------------
    if row.get("antivirus_status") == "Enterprise":
        score += 5
    elif row.get("antivirus_status") == "Consumer":
        score += 2

    # ---------------------------------------------------------
    # Email Security
    # ---------------------------------------------------------
    if row.get("email_security_level") == "Advanced":
        score += 5
    elif row.get("email_security_level") == "Basic":
        score += 1
    else:
        score -= 5

    # ---------------------------------------------------------
    # Security Training
    # ---------------------------------------------------------
    if row.get("security_training") == "Within 12 Months":
        score += 4
    elif row.get("security_training") == "1-3 Years Ago":
        score += 1
    else:
        score -= 4

    # ---------------------------------------------------------
    # HTTPS Awareness
    # ---------------------------------------------------------
    if row.get("https_awareness") == "Always":
        score += 4
    elif row.get("https_awareness") == "Usually":
        score += 2
    elif row.get("https_awareness") == "Never":
        score -= 4

    # ---------------------------------------------------------
    # Backup Frequency
    # ---------------------------------------------------------
    if row.get("backup_frequency") == "Automatic":
        score += 4
    elif row.get("backup_frequency") == "Monthly":
        score += 2
    elif row.get("backup_frequency") == "Never":
        score -= 4

    # ---------------------------------------------------------
    # Browser Password Storage
    # ---------------------------------------------------------
    if row.get("browser_password_storage") == "Password Manager":
        score += 3
    elif row.get("browser_password_storage") == "Browser Storage":
        score -= 1

    # ---------------------------------------------------------
    # Software Source
    # ---------------------------------------------------------
    if row.get("software_source") == "Official Store":
        score += 3
    elif row.get("software_source") == "Verified Website":
        score += 1
    else:
        score -= 4

    # ---------------------------------------------------------
    # Account Alerts
    # ---------------------------------------------------------
    if row.get("account_alerts_enabled") == "Yes":
        score += 2

    # ---------------------------------------------------------
    # Cloud Backup
    # ---------------------------------------------------------
    if row.get("cloud_backup_enabled") == "Yes":
        score += 2

    # ---------------------------------------------------------
    # Social Media Privacy
    # ---------------------------------------------------------
    if row.get("social_media_privacy") == "Strict":
        score += 3
    elif row.get("social_media_privacy") == "Moderate":
        score += 1
    else:
        score -= 3

    # ---------------------------------------------------------
    # Shared Device Usage
    # ---------------------------------------------------------
    if row.get("shared_device_usage") == "Frequently":
        score -= 4
    elif row.get("shared_device_usage") == "Sometimes":
        score -= 1

    # ---------------------------------------------------------
    # Phishing Click History
    # ---------------------------------------------------------
    phishing_clicks = str(row.get("past_phishing_clicks", ""))

    if phishing_clicks == "0":
        score += 4
    elif phishing_clicks == "1":
        score += 1
    elif phishing_clicks == "2-5":
        score -= 3
    else:
        score -= 6

    # ---------------------------------------------------------
    # Keep score between 1 and 100
    # ---------------------------------------------------------
    score = max(1, min(100, round(score)))

    return score


def calculate_future_risk(trust_score):
    """
    Convert Cyber Trust Score into an estimated future risk score.

    Higher future risk = more cybersecurity risk.
    """

    risk = 100 - trust_score

    return max(0, min(100, round(risk)))


def assign_risk_level(trust_score):
    """
    Assign risk category based on Cyber Trust Score.

    75-100 -> Low
    45-74  -> Medium
    1-44   -> High
    """

    if trust_score >= 75:
        return "Low"

    elif trust_score >= 45:
        return "Medium"

    else:
        return "High"


def calculate_security_metrics(user_data):
    """
    Calculate all cybersecurity metrics for a user.

    Returns:
        {
            "cyber_trust_score": ...,
            "future_risk_score": ...,
            "risk_level": ...
        }
    """

    trust_score = calculate_trust_score(user_data)

    future_risk = calculate_future_risk(trust_score)

    risk_level = assign_risk_level(trust_score)

    return {
        "cyber_trust_score": trust_score,
        "future_risk_score": future_risk,
        "risk_level": risk_level
    }