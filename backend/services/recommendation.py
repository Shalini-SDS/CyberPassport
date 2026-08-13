from typing import Any, Dict, List

from services.trust_score import normalize_features

PRIORITY_ORDER = {"Critical": 0, "High": 1, "Medium": 2, "Low": 3}


def build_recommendations(features: Dict[str, Any]) -> List[Dict[str, Any]]:
    f = normalize_features(features)
    recs: List[Dict[str, Any]] = []

    def add(category: str, priority: str, title: str, issue: str, recommendation: str, reason: str, impact: int = 10) -> None:
        recs.append({
            "category": category,
            "priority": priority,
            "title": title,
            "issue": issue,
            "recommendation": recommendation,
            "reason": reason,
            "completed": False,
            "impact": f"+{impact} pts",
            "effort": "15 min" if priority in {"High", "Critical"} else "30 min",
        })

    if f["mfa_type"] == "No MFA":
        add("MFA", "Critical", "Enable Multi-Factor Authentication", "MFA is not enabled", "Enable an authenticator app or hardware key for important accounts.", "MFA adds protection when passwords are exposed.", 22)
    elif f["mfa_type"] == "SMS Only":
        add("MFA", "High", "Upgrade MFA Method", "SMS-only MFA is weaker", "Use an authenticator app or hardware key for primary accounts.", "App and hardware-key MFA are more resilient than SMS.", 14)
    if f["mfa_coverage"] in {"Some", "Few/None"}:
        add("MFA", "High", "Expand MFA Coverage", "MFA is missing on several accounts", "Enable MFA for email, banking, work, and social accounts.", "Broad MFA coverage lowers account takeover risk.", 16)
    if f["password_management"] != "Password Manager":
        add("Password Security", "High", "Use a Password Manager", "Passwords are not managed in a dedicated vault", "Move passwords into a reputable password manager and generate unique passwords.", "Unique passwords limit damage from one breached service.", 15)
    if f["password_length"] in {"Under 8", "8-11"}:
        add("Password Security", "Medium", "Increase Password Length", "Typical passwords are short", "Use long generated passwords or passphrases.", "Length makes guessing and cracking harder.", 8)
    if f["device_encryption"] != "Verified":
        add("Device Security", "High", "Verify Device Encryption", "Device encryption is not confirmed", "Turn on and verify built-in disk encryption on primary devices.", "Encryption protects data if a device is lost.", 12)
    if f["os_update_status"] in {"Within 6 Months", "Rarely Updated"}:
        add("Device Security", "High", "Enable Automatic Updates", "Operating system updates lag behind", "Enable automatic OS and browser updates.", "Updates close known vulnerabilities.", 12)
    if f["vpn_usage"] in {"Never", "Rarely"} or f["public_wifi_usage"] in {"Occasionally Unprotected", "Frequently Unprotected"}:
        add("Network Security", "Medium", "Protect Public Network Use", "Public or sensitive browsing is not consistently protected", "Avoid sensitive work on public Wi-Fi or use a trusted VPN.", "Network protection reduces interception risk.", 10)
    if f["phishing_detection"] in {"Sometimes Unsure", "Often Unsure"} or f["past_phishing_clicks"] != "0":
        add("Phishing Protection", "High", "Complete Phishing Awareness Training", "Phishing resilience needs improvement", "Complete a current phishing-awareness module and use email safety checks.", "Awareness reduces risky clicks and credential entry.", 14)
    if f["software_source"] == "Unknown Sources":
        add("Software Security", "Critical", "Use Trusted Software Sources", "Software is installed from unknown sources", "Install software from official stores or verified vendor websites.", "Trusted sources reduce malware risk.", 20)
    if f["backup_frequency"] in {"Never", "Occasionally"}:
        add("Backup & Recovery", "Medium", "Automate Important Backups", "Backups are missing or irregular", "Enable automatic cloud or local backups for critical files.", "Reliable backups improve recovery from ransomware and loss.", 10)
    if f["account_alerts_enabled"] == "No":
        add("Account Security", "Medium", "Enable Account Alerts", "Suspicious sign-in alerts are disabled", "Turn on login and recovery alerts on important accounts.", "Fast alerts help detect compromise.", 7)
    if f["social_media_privacy"] == "Public":
        add("Privacy", "Low", "Review Social Privacy", "Social profiles are public", "Limit public profile details and audience visibility.", "Less public data lowers social-engineering risk.", 5)

    return sorted(recs, key=lambda r: PRIORITY_ORDER.get(r["priority"], 9))
