from datetime import datetime, timedelta, timezone
from io import BytesIO
from typing import Any, Dict, Optional

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


def build_passport(user: Dict[str, Any], assessment: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    assessment = assessment or {}
    issued = assessment.get("created_at") or datetime.now(timezone.utc)
    if isinstance(issued, str):
        issued_text = issued[:10]
    else:
        issued_text = issued.date().isoformat()

    profile = user.get("profile", {}) or {}
    passport_id = assessment.get("passport_id") or f"CP-{datetime.now().year}-{str(user.get('id') or user.get('_id') or 'USER')[-6:].upper()}"
    risk_level = assessment.get("risk_level", "Unknown")

    return {
        "title": "CyberPassport",
        "user_name": user.get("name", "CyberPassport User"),
        "user_id": str(user.get("id") or user.get("_id") or ""),
        "passport_id": passport_id,
        "assessment_id": str(assessment.get("id") or assessment.get("_id") or ""),
        "assessment_date": issued_text,
        "expiry_date": (datetime.now(timezone.utc) + timedelta(days=365)).date().isoformat(),
        "cyber_trust_score": assessment.get("cyber_trust_score", 0),
        "future_risk_score": assessment.get("future_risk_score", 0),
        "risk_level": risk_level,
        "status": "Active",
        "classification": "Low Risk" if risk_level == "Low" else "Medium Risk",
        "country": profile.get("country", "CYBERSPACE"),
        "occupation": profile.get("occupation", "Security Professional"),
        "verification_url": f"verify.cyberpassport.id/{passport_id[-4:]}",
        "digital_signature": f"sha256:{passport_id[-6:]}",
        "authority_seal": "CyberPassport Authority",
        "major_risk_factors": assessment.get("risk_factors", [])[:5],
        "top_recommendations": assessment.get("recommendations", [])[:5],
        "security_category_summary": assessment.get("security_category_status", []),
    }


def generate_passport_pdf(passport: Dict[str, Any]) -> bytes:
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=48, leftMargin=48, topMargin=48, bottomMargin=48)
    styles = getSampleStyleSheet()
    story = [
        Paragraph("CyberPassport Authority", styles["Title"]),
        Paragraph("Digital Identity Passport", styles["Heading2"]),
        Spacer(1, 16),
    ]
    rows = [
        ["Name", passport["user_name"]],
        ["Passport ID", passport["passport_id"]],
        ["User ID", passport["user_id"]],
        ["Assessment Date", passport["assessment_date"]],
        ["Trust Score", str(passport["cyber_trust_score"])],
        ["Future Risk Score", str(passport["future_risk_score"])],
        ["Risk Level", passport["risk_level"]],
        ["Expires", passport["expiry_date"]],
    ]
    table = Table(rows, colWidths=[140, 320])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#E8F4F2")),
        ("TEXTCOLOR", (0, 0), (-1, -1), colors.HexColor("#1E1E1E")),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#D1D5DB")),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("PADDING", (0, 0), (-1, -1), 8),
    ]))
    story.extend([table, Spacer(1, 18), Paragraph("Major Risk Factors", styles["Heading3"])])
    for item in passport["major_risk_factors"] or [{"issue": "No risk factors recorded"}]:
        story.append(Paragraph(f"- {item.get('category', 'Security')}: {item.get('issue', item)}", styles["BodyText"]))
    story.extend([Spacer(1, 12), Paragraph("Top Recommendations", styles["Heading3"])])
    for item in passport["top_recommendations"] or [{"title": "Complete a cyber assessment"}]:
        story.append(Paragraph(f"- {item.get('title', item)}", styles["BodyText"]))
    doc.build(story)
    return buffer.getvalue()
