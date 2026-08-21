from __future__ import annotations

import hashlib
import json
import os
import calendar
from datetime import datetime, timezone
from io import BytesIO
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Tuple
from uuid import uuid4

from bson import ObjectId
from PIL import Image, ImageDraw, ImageFont, ImageOps
from reportlab.graphics import renderPDF
from reportlab.graphics.barcode import qr
from reportlab.graphics.shapes import Drawing
from reportlab.lib.utils import ImageReader
from reportlab.lib import colors
from reportlab.lib.pagesizes import landscape, letter
from reportlab.pdfgen import canvas

from database.collections import ASSESSMENTS, PASSPORTS, RECOMMENDATIONS, USERS

AUTHORITY = "CyberPassport Authority"
HASH_FIELDS = ("passport_id", "user_id", "trust_score", "risk_level", "issued_date", "expiry_date")
PRIORITY_WEIGHT = {"Critical": 0, "High": 1, "Medium": 2, "Low": 3}


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def as_date_text(value: Any, fallback: Optional[datetime] = None) -> str:
    value = value or fallback or utc_now()
    if isinstance(value, str):
        return value[:10]
    if hasattr(value, "date"):
        return value.date().isoformat()
    return str(value)[:10]


def add_months(value: datetime, months: int) -> datetime:
    month_index = value.month - 1 + months
    year = value.year + month_index // 12
    month = month_index % 12 + 1
    day = min(value.day, calendar.monthrange(year, month)[1])
    return value.replace(year=year, month=month, day=day)


def normalize_score(value: Any) -> int:
    try:
        return max(0, min(100, int(round(float(value)))))
    except Exception:
        return 0


def public_base_url() -> str:
    raw = os.getenv("PUBLIC_BASE_URL") or os.getenv("FRONTEND_URL") or "http://localhost:5173"
    return raw.rstrip("/")


def passport_verification_url(passport_id: str) -> str:
    return f"{public_base_url()}/verify/{passport_id}"


def canonical_payload(passport: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "passport_id": passport.get("passport_id", ""),
        "user_id": passport.get("user_id", ""),
        "trust_score": normalize_score(passport.get("cyber_trust_score")),
        "risk_level": passport.get("risk_level", "Unknown"),
        "issued_date": passport.get("issued_date", ""),
        "expiry_date": passport.get("expiry_date", ""),
    }


def integrity_hash(passport: Dict[str, Any]) -> str:
    canonical = json.dumps(canonical_payload(passport), sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


def recommendation_text(item: Any) -> str:
    if isinstance(item, str):
        return item
    if isinstance(item, dict):
        for key in ("title", "recommendation", "issue", "reason", "category"):
            value = item.get(key)
            if value:
                return str(value)
    return "Updated security recommendation"


def risk_factor_text(item: Any) -> str:
    if isinstance(item, str):
        return item
    if isinstance(item, dict):
        category = item.get("category") or "Security"
        issue = item.get("issue") or item.get("description") or item.get("reason") or "Risk factor"
        return f"{category}: {issue}"
    return "Security risk factor"


def sorted_recommendations(items: Iterable[Any]) -> List[Any]:
    def rank(item: Any) -> Tuple[int, str]:
        if isinstance(item, dict):
            return (PRIORITY_WEIGHT.get(str(item.get("priority", "Medium")), 2), str(item.get("title", "")))
        return (2, str(item))

    return sorted(list(items), key=rank)


def security_badges(assessment: Dict[str, Any]) -> List[Dict[str, str]]:
    statuses = assessment.get("security_category_status") or []
    if statuses:
        return [
            {
                "label": str(item.get("label", "Security")),
                "status": str(item.get("status", "fair")).title(),
                "score": str(normalize_score(item.get("score", 0))),
            }
            for item in statuses[:5]
            if isinstance(item, dict)
        ]

    return [
        {"label": "MFA", "status": "Not Assessed", "score": "0"},
        {"label": "Device Security", "status": "Not Assessed", "score": "0"},
        {"label": "Network Security", "status": "Not Assessed", "score": "0"},
        {"label": "Security Awareness", "status": "Not Assessed", "score": "0"},
        {"label": "Account Protection", "status": "Not Assessed", "score": "0"},
    ]


def build_passport(
    user: Dict[str, Any],
    assessment: Optional[Dict[str, Any]],
    passport_record: Optional[Dict[str, Any]] = None,
    recommendations: Optional[List[Any]] = None,
) -> Dict[str, Any]:
    assessment = assessment or {}
    passport_record = passport_record or {}
    profile = user.get("profile", {}) or {}
    user_id = str(user.get("id") or user.get("_id") or assessment.get("user_id") or passport_record.get("user_id") or "")
    issued = passport_record.get("issued_at") or assessment.get("created_at") or utc_now()
    issued_text = as_date_text(issued)
    issued_datetime = datetime.fromisoformat(issued_text).replace(tzinfo=timezone.utc)
    expiry_text = as_date_text(add_months(issued_datetime, 2))
    passport_id = passport_record.get("passport_id") or assessment.get("passport_id") or f"CP-{utc_now().year}-{uuid4().hex[:8].upper()}"
    risk_level = assessment.get("risk_level") or passport_record.get("risk_level") or "Unknown"
    score = normalize_score(assessment.get("cyber_trust_score", passport_record.get("cyber_trust_score", 0)))
    verification_url = passport_verification_url(passport_id)
    status = passport_record.get("status") or "Active"

    rec_source = recommendations if recommendations is not None else assessment.get("recommendations", [])
    top_recs = sorted_recommendations(rec_source)[:5]

    passport = {
        "title": "CyberPassport",
        "subtitle": "Digital Identity Passport",
        "authority": AUTHORITY,
        "user_name": user.get("name") or profile.get("name") or "Not Provided",
        "user_id": user_id,
        "passport_id": passport_id,
        "assessment_id": str(assessment.get("id") or assessment.get("_id") or passport_record.get("assessment_id") or ""),
        "issued_date": issued_text,
        "assessment_date": issued_text,
        "expiry_date": expiry_text,
        "cyber_trust_score": score,
        "future_risk_score": normalize_score(assessment.get("future_risk_score", 0)),
        "risk_level": risk_level,
        "security_status": "Verified" if risk_level in {"Low", "Medium", "High"} else "Assessment Required",
        "status": status,
        "country": profile.get("country") or assessment.get("profile", {}).get("country") or "Not Provided",
        "occupation": profile.get("occupation") or assessment.get("profile", {}).get("occupation") or "Not Provided",
        "photo_url": profile.get("profile_photo_url") or profile.get("photo_url") or profile.get("profile_photo") or "",
        "verification_url": verification_url,
        "issuing_authority": AUTHORITY,
        "major_risk_factors": [risk_factor_text(item) for item in (assessment.get("risk_factors") or [])[:5]],
        "top_recommendations": [recommendation_text(item) for item in top_recs],
        "security_badges": security_badges(assessment),
    }
    passport["integrity_hash"] = passport_record.get("integrity_hash") or integrity_hash(passport)
    passport["digital_signature"] = f"sha256:{passport['integrity_hash'][:16]}"
    passport["qr_svg"] = generate_qr_svg(verification_url)
    return passport


def find_user(db: Any, user_id: str) -> Dict[str, Any]:
    try:
        user = db[USERS].find_one({"_id": ObjectId(user_id)})
    except Exception as exc:
        raise ValueError("Invalid user id") from exc
    if not user:
        raise LookupError("User not found")
    user["id"] = str(user["_id"])
    return user


def latest_assessment(db: Any, user_id: str) -> Optional[Dict[str, Any]]:
    assessment = db[ASSESSMENTS].find_one({"user_id": user_id}, sort=[("created_at", -1)])
    if assessment:
        assessment["id"] = str(assessment["_id"])
    return assessment


def user_recommendations(db: Any, user_id: str, assessment_id: str = "") -> List[Dict[str, Any]]:
    query: Dict[str, Any] = {"user_id": user_id}
    if assessment_id:
        query["assessment_id"] = assessment_id
    rows = list(db[RECOMMENDATIONS].find(query).sort([("created_at", -1)]).limit(12))
    return [{**row, "id": str(row.get("_id", "")), "_id": str(row.get("_id", ""))} for row in rows]


def ensure_passport_for_user(db: Any, user_id: str) -> Dict[str, Any]:
    user = find_user(db, user_id)
    assessment = latest_assessment(db, user_id)
    existing = db[PASSPORTS].find_one({"user_id": user_id}) or {}
    recommendations = user_recommendations(db, user_id, str(assessment.get("id", "")) if assessment else "")
    passport = build_passport(user, assessment, existing, recommendations)
    now = utc_now()
    update_doc = {
        "user_id": user_id,
        "assessment_id": passport["assessment_id"],
        "passport_id": passport["passport_id"],
        "issued_at": datetime.fromisoformat(passport["issued_date"]).replace(tzinfo=timezone.utc),
        "expiry_date": passport["expiry_date"],
        "cyber_trust_score": passport["cyber_trust_score"],
        "risk_level": passport["risk_level"],
        "status": passport["status"],
        "integrity_hash": integrity_hash(passport),
        "updated_at": now,
    }
    db[PASSPORTS].update_one({"user_id": user_id}, {"$set": update_doc, "$setOnInsert": {"created_at": now}}, upsert=True)
    passport["integrity_hash"] = update_doc["integrity_hash"]
    passport["digital_signature"] = f"sha256:{passport['integrity_hash'][:16]}"
    return passport


def passport_by_identifier(db: Any, identifier: str) -> Dict[str, Any]:
    if ObjectId.is_valid(identifier):
        return ensure_passport_for_user(db, identifier)

    record = db[PASSPORTS].find_one({"passport_id": identifier})
    if not record:
        raise LookupError("Passport not found")
    user_id = str(record.get("user_id", ""))
    user = find_user(db, user_id)
    assessment = latest_assessment(db, user_id)
    recommendations = user_recommendations(db, user_id, str(assessment.get("id", "")) if assessment else "")
    return build_passport(user, assessment, record, recommendations)


def verify_passport(db: Any, passport_id: str) -> Dict[str, Any]:
    record = db[PASSPORTS].find_one({"passport_id": passport_id})
    if not record:
        return {"valid": False, "status": "Invalid", "reason": "Passport not found", "verification_time": utc_now().isoformat()}

    passport = passport_by_identifier(db, passport_id)
    stored_hash = record.get("integrity_hash", "")
    computed_hash = integrity_hash(passport)
    expired = passport.get("expiry_date", "") < utc_now().date().isoformat()
    active = record.get("status", "Active") == "Active"
    authentic = bool(stored_hash and stored_hash == computed_hash)
    valid = active and not expired and authentic

    visibility = ((find_user(db, str(record.get("user_id", ""))).get("preferences", {}) or {}).get("privacy", {}) or {}).get("visibility", "verification_only")
    response = {
        "valid": valid,
        "status": "Valid / Authentic" if valid else "Invalid",
        "passport_id": passport["passport_id"],
        "holder_name": passport["user_name"],
        "issued_date": passport["issued_date"],
        "expiry_date": passport["expiry_date"],
        "cyber_trust_score": passport["cyber_trust_score"],
        "risk_level": passport["risk_level"],
        "issuing_authority": AUTHORITY,
        "verification_time": utc_now().isoformat(),
        "tamper_status": "Intact" if authentic else "Hash mismatch",
        "expired": expired,
        "active": active,
    }
    if visibility == "private":
        response["holder_name"] = "Private profile"
        response["cyber_trust_score"] = None
        response["risk_level"] = "Private"
    elif visibility == "verification_only":
        response["cyber_trust_score"] = None
        response["risk_level"] = "Not disclosed"
    return response


def qr_matrix(value: str) -> List[List[bool]]:
    widget = qr.QrCodeWidget(value)
    widget.draw()
    return [[bool(cell) for cell in row] for row in widget.qr.modules]


def generate_qr_svg(value: str, size: int = 180) -> str:
    matrix = qr_matrix(value)
    count = len(matrix)
    quiet = 4
    unit = size / (count + quiet * 2)
    parts = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 {size} {size}">']
    parts.append('<rect width="100%" height="100%" fill="#ffffff"/>')
    for y, row in enumerate(matrix):
        for x, cell in enumerate(row):
            if cell:
                parts.append(f'<rect x="{(x + quiet) * unit:.2f}" y="{(y + quiet) * unit:.2f}" width="{unit:.2f}" height="{unit:.2f}" fill="#0B1F1A"/>')
    parts.append("</svg>")
    return "".join(parts)


def draw_pdf_qr(c: canvas.Canvas, value: str, x: float, y: float, size: float) -> None:
    widget = qr.QrCodeWidget(value)
    bounds = widget.getBounds()
    drawing = Drawing(size, size, transform=[size / (bounds[2] - bounds[0]), 0, 0, size / (bounds[3] - bounds[1]), 0, 0])
    drawing.add(widget)
    renderPDF.draw(drawing, c, x, y)


def stored_photo_path(photo_url: str) -> Optional[Path]:
    if not photo_url:
        return None
    name = os.path.basename(photo_url)
    path = Path(__file__).resolve().parent.parent / "uploads" / name
    return path if path.is_file() else None


def generate_passport_pdf(passport: Dict[str, Any]) -> bytes:
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=landscape(letter))
    width, height = landscape(letter)
    emerald = colors.HexColor("#063D35")
    gold = colors.HexColor("#C6A15B")
    paper = colors.HexColor("#F7F1E5")
    ink = colors.HexColor("#1E1E1E")

    c.setFillColor(colors.HexColor("#EDE7DA"))
    c.rect(0, 0, width, height, stroke=0, fill=1)
    margin = 38
    panel_w = (width - margin * 2 - 16) / 2
    panel_h = 356
    y = (height - panel_h) / 2

    for i, x in enumerate([margin, margin + panel_w + 16]):
        c.setFillColor(paper)
        c.roundRect(x, y, panel_w, panel_h, 10, stroke=0, fill=1)
        c.setStrokeColor(gold)
        c.setLineWidth(1.2)
        c.roundRect(x + 5, y + 5, panel_w - 10, panel_h - 10, 8, stroke=1, fill=0)
        c.setFillColor(emerald)
        c.roundRect(x, y + panel_h - 70, panel_w, 70, 10, stroke=0, fill=1)
        c.setFillColor(gold)
        c.rect(x, y + panel_h - 73, panel_w, 3, stroke=0, fill=1)
        c.setFillColor(colors.white)
        c.setFont("Helvetica-Bold", 18)
        c.drawString(x + 20, y + panel_h - 32, "CYBERPASSPORT")
        c.setFont("Helvetica", 8)
        c.drawString(x + 20, y + panel_h - 47, "DIGITAL IDENTITY PASSPORT" if i == 0 else "CYBERPASSPORT AUTHORITY")

    x = margin
    c.setFillColor(colors.white)
    c.roundRect(x + 20, y + 108, 88, 112, 6, stroke=1, fill=1)
    photo_path = stored_photo_path(passport.get("photo_url", ""))
    if photo_path:
        c.drawImage(ImageReader(str(photo_path)), x + 22, y + 110, width=84, height=108, preserveAspectRatio=True, anchor="c", mask="auto")
    else:
        c.setFillColor(colors.HexColor("#DCEBE7"))
        c.circle(x + 64, y + 176, 20, stroke=0, fill=1)
        c.roundRect(x + 38, y + 128, 52, 34, 14, stroke=0, fill=1)
    c.setFillColor(ink)
    c.setFont("Helvetica-Bold", 8)
    fields = [
        ("PASSPORT NO.", passport["passport_id"]),
        ("NAME", passport["user_name"]),
        ("COUNTRY", passport["country"]),
        ("OCCUPATION", passport["occupation"]),
        ("ISSUED", passport["issued_date"]),
        ("EXPIRES", passport["expiry_date"]),
    ]
    fx = x + 125
    fy = y + 214
    for label, value in fields:
        c.setFillColor(colors.HexColor("#56615E"))
        c.setFont("Helvetica-Bold", 6)
        c.drawString(fx, fy, label)
        c.setFillColor(ink)
        c.setFont("Helvetica", 8)
        c.drawString(fx + 72, fy, str(value)[:28])
        fy -= 22

    c.setFillColor(colors.HexColor("#FFF7E8"))
    c.roundRect(x + 20, y + 38, panel_w - 40, 48, 6, stroke=0, fill=1)
    c.setFillColor(ink)
    c.setFont("Helvetica-Bold", 8)
    c.drawString(x + 34, y + 67, "CYBER TRUST SCORE")
    c.setFont("Helvetica-Bold", 20)
    c.setFillColor(emerald)
    c.drawString(x + 34, y + 43, f"{passport['cyber_trust_score']} / 100")
    c.setFillColor(ink)
    c.setFont("Helvetica-Bold", 9)
    c.drawRightString(x + panel_w - 34, y + 58, f"RISK: {passport['risk_level']}")

    x = margin + panel_w + 16
    c.setFillColor(ink)
    c.setFont("Helvetica-Bold", 8)
    c.drawString(x + 20, y + 256, "TOP RECOMMENDATIONS")
    c.setFont("Helvetica", 8)
    rec_y = y + 236
    for item in (passport.get("top_recommendations") or ["Complete a cybersecurity assessment"])[:5]:
        c.drawString(x + 24, rec_y, f"- {str(item)[:48]}")
        rec_y -= 18
    draw_pdf_qr(c, passport["verification_url"], x + 28, y + 54, 108)
    c.setFont("Helvetica-Bold", 6)
    c.drawCentredString(x + 82, y + 42, "SCAN TO VERIFY")
    detail_x = x + 154
    c.setFont("Helvetica-Bold", 7)
    c.drawString(detail_x, y + 145, "PASSPORT DETAILS")
    c.setFont("Helvetica", 7)
    for label, value in [
        ("PASSPORT NO.", passport["passport_id"]),
        ("ISSUED", passport["issued_date"]),
        ("EXPIRES", passport["expiry_date"]),
        ("STATUS", passport["security_status"]),
        ("VERIFY", passport["verification_url"]),
    ]:
        c.setFont("Helvetica-Bold", 5.5)
        c.drawString(detail_x, rec_y := (rec_y - 0) if False else y + 128, "")
        yline = y + 128 - 18 * [("PASSPORT NO.", passport["passport_id"]), ("ISSUED", passport["issued_date"]), ("EXPIRES", passport["expiry_date"]), ("STATUS", passport["security_status"]), ("VERIFY", passport["verification_url"])].index((label, value))
        c.drawString(detail_x, yline, label)
        c.setFont("Helvetica", 7)
        c.drawString(detail_x + 70, yline, str(value)[:34])
    c.setFillColor(emerald)
    c.rect(x, y, panel_w, 24, stroke=0, fill=1)
    c.setFillColor(gold)
    c.setFont("Helvetica-Bold", 7)
    c.drawCentredString(x + panel_w / 2, y + 8, "VERIFIED - AUTHORITY SEALED - TAMPER-EVIDENT")

    c.showPage()
    c.save()
    return buffer.getvalue()


def font(size: int, bold: bool = False) -> ImageFont.ImageFont:
    names = ["arialbd.ttf" if bold else "arial.ttf", "DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf"]
    for name in names:
        try:
            return ImageFont.truetype(name, size)
        except Exception:
            continue
    return ImageFont.load_default()


def rounded(draw: ImageDraw.ImageDraw, box: Tuple[int, int, int, int], radius: int, fill: str, outline: Optional[str] = None, width: int = 1) -> None:
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def draw_qr_png(draw: ImageDraw.ImageDraw, value: str, x: int, y: int, size: int) -> None:
    matrix = qr_matrix(value)
    quiet = 4
    count = len(matrix) + quiet * 2
    unit = max(1, size // count)
    actual = unit * count
    draw.rectangle((x, y, x + actual, y + actual), fill="#FFFFFF")
    for row_index, row in enumerate(matrix):
        for col_index, cell in enumerate(row):
            if cell:
                px = x + (col_index + quiet) * unit
                py = y + (row_index + quiet) * unit
                draw.rectangle((px, py, px + unit - 1, py + unit - 1), fill="#0B1F1A")


def generate_passport_png(passport: Dict[str, Any]) -> bytes:
    scale = 2
    w, h = 1400, 820
    image = Image.new("RGB", (w, h), "#EDE7DA")
    draw = ImageDraw.Draw(image)
    emerald = "#063D35"
    gold = "#C6A15B"
    paper = "#F7F1E5"
    ink = "#1E1E1E"
    panel_w, panel_h = 652, 620
    y = 92
    left, right = 44, 704

    for x in (left, right):
        rounded(draw, (x, y, x + panel_w, y + panel_h), 20, paper, gold, 3)
        rounded(draw, (x, y, x + panel_w, y + 116), 20, emerald)
        draw.rectangle((x, y + 94, x + panel_w, y + 116), fill=emerald)
        draw.rectangle((x, y + 116, x + panel_w, y + 123), fill=gold)
        draw.text((x + 34, y + 26), "CYBERPASSPORT", fill="#FFFFFF", font=font(36, True))
        draw.text((x + 36, y + 72), "DIGITAL IDENTITY PASSPORT", fill="#D9C58D", font=font(15, True))

    photo_box = (left + 34, y + 168, left + 180, y + 352)
    draw.rounded_rectangle(photo_box, radius=12, fill="#FFFFFF", outline=gold, width=2)
    photo_path = stored_photo_path(passport.get("photo_url", ""))
    if photo_path:
        with Image.open(photo_path) as source:
            photo = ImageOps.fit(ImageOps.exif_transpose(source).convert("RGB"), (136, 176), method=Image.Resampling.LANCZOS)
            px = left + 39
            py = y + 172
            image.paste(photo, (px, py))
    else:
        draw.ellipse((left + 79, y + 206, left + 135, y + 262), fill="#C9DDD8")
        draw.rounded_rectangle((left + 58, y + 272, left + 156, y + 330), radius=30, fill="#C9DDD8")

    fields = [
        ("PASSPORT NO.", passport["passport_id"]),
        ("NAME", passport["user_name"]),
        ("COUNTRY", passport["country"]),
        ("OCCUPATION", passport["occupation"]),
        ("ISSUED", passport["issued_date"]),
        ("EXPIRES", passport["expiry_date"]),
    ]
    fy = y + 176
    for label, value in fields:
        draw.text((left + 220, fy), label, fill="#63706C", font=font(13, True))
        draw.text((left + 360, fy), str(value)[:24], fill=ink, font=font(18, True))
        fy += 47

    rounded(draw, (left + 34, y + 430, left + panel_w - 34, y + 548), 14, "#FFF7E8", "#E7D5AE", 2)
    draw.text((left + 62, y + 452), "CYBER TRUST SCORE", fill="#63706C", font=font(15, True))
    draw.text((left + 62, y + 480), f"{passport['cyber_trust_score']} / 100", fill=emerald, font=font(38, True))
    draw.text((left + 395, y + 485), f"RISK LEVEL: {passport['risk_level']}", fill=ink, font=font(18, True))

    draw.text((right + 34, y + 156), "TOP RECOMMENDATIONS", fill=ink, font=font(17, True))
    ry = y + 194
    for item in (passport.get("top_recommendations") or ["Complete a cybersecurity assessment"])[:5]:
        draw.text((right + 44, ry), f"- {str(item)[:48]}", fill=ink, font=font(16))
        ry += 36

    draw_qr_png(draw, passport["verification_url"], right + 46, y + 366, 210)
    draw.text((right + 84, y + 584), "SCAN TO VERIFY", fill="#63706C", font=font(12, True))
    dx = right + 296
    draw.text((dx, y + 370), "PASSPORT DETAILS", fill=ink, font=font(15, True))
    dy = y + 404
    for label, value in [
        ("PASSPORT NO.", passport["passport_id"]),
        ("ISSUED", passport["issued_date"]),
        ("EXPIRES", passport["expiry_date"]),
        ("STATUS", passport["security_status"]),
        ("VERIFY", passport["verification_url"]),
    ]:
        draw.text((dx, dy), label, fill="#63706C", font=font(11, True))
        if label == "VERIFY":
            draw.text((dx + 128, dy), str(value)[:24], fill=ink, font=font(11))
            draw.text((dx + 128, dy + 16), str(value)[24:48], fill=ink, font=font(11))
        else:
            draw.text((dx + 128, dy), str(value)[:32], fill=ink, font=font(13))
        dy += 34

    draw.rectangle((right, y + panel_h - 42, right + panel_w, y + panel_h), fill=emerald)
    draw.text((right + 140, y + panel_h - 30), "VERIFIED - AUTHORITY SEALED - TAMPER-EVIDENT", fill=gold, font=font(15, True))

    if scale != 1:
        image = image.resize((w * scale, h * scale), Image.Resampling.LANCZOS)
    output = BytesIO()
    image.save(output, format="PNG")
    return output.getvalue()
