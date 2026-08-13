from typing import Any, Dict, Optional


def mongo_doc(doc: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    if not doc:
        return None
    converted = dict(doc)
    if "_id" in converted:
        converted["id"] = str(converted.pop("_id"))
    return converted


def public_user(doc: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    converted = mongo_doc(doc)
    if converted:
        converted.pop("password_hash", None)
    return converted
