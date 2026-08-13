from typing import Any, Dict, List

from services.trust_score import normalize_features


def analyze_risk_factors(features: Dict[str, Any]) -> List[Dict[str, str]]:
    f = normalize_features(features)
    checks = [
        ("MFA", "High", f["mfa_type"] == "No MFA", "No MFA enabled", "Accounts without MFA have reduced protection against credential compromise."),
        ("MFA", "Medium", f["mfa_coverage"] in {"Some", "Few/None"}, "Limited MFA coverage", "Important accounts should use a second factor wherever possible."),
        ("Password Security", "High", f["password_management"] in {"Same Password", "Written Notes"}, "Unsafe password management", "Reused or written passwords increase account takeover risk."),
        ("Password Security", "High", f["password_length"] == "Under 8", "Short passwords", "Short passwords are easier to guess or crack."),
        ("Device Security", "High", f["device_encryption"] in {"No", "Unsure"}, "Device encryption is not verified", "Lost or stolen devices can expose local data without encryption."),
        ("Device Security", "Medium", f["os_update_status"] in {"Within 6 Months", "Rarely Updated"}, "Operating system updates lag behind", "Security patches reduce exposure to known vulnerabilities."),
        ("Network Security", "Medium", f["vpn_usage"] in {"Never", "Rarely"}, "Limited VPN use", "Sensitive work on untrusted networks benefits from encrypted transport."),
        ("Network Security", "High", f["public_wifi_usage"] == "Frequently Unprotected", "Frequent unprotected public Wi-Fi", "Untrusted networks increase interception and impersonation risk."),
        ("Phishing Protection", "High", f["phishing_detection"] == "Often Unsure", "Low phishing confidence", "Unrecognized phishing attempts can lead to account compromise."),
        ("Security Awareness", "Medium", f["security_training"] == "Never", "No recent security training", "Current awareness training helps identify common attack patterns."),
        ("Privacy", "Medium", f["social_media_privacy"] == "Public", "Public social profile", "Public information can make impersonation and targeted scams easier."),
        ("Software Security", "High", f["software_source"] == "Unknown Sources", "Software from unknown sources", "Untrusted installers can introduce malware or unwanted access."),
        ("Backup & Recovery", "High", f["backup_frequency"] == "Never", "No regular backups", "Backups reduce impact from ransomware, device loss, and accidental deletion."),
        ("Account Security", "Medium", f["account_alerts_enabled"] == "No", "Account alerts disabled", "Alerts help detect suspicious sign-ins early."),
        ("Email Security", "High", f["email_security_level"] == "Weak", "Weak email security", "Email is often the recovery path for other accounts."),
        ("Phishing Protection", "High", f["past_phishing_clicks"] in {"2-5", "5+"}, "Past phishing clicks", "Previous phishing interactions indicate a need for stronger controls and training."),
    ]
    return [{"category": c, "severity": s, "issue": i, "explanation": e} for c, s, ok, i, e in checks if ok]
