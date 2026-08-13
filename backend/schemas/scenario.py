from typing import Any, Dict, Optional

from pydantic import BaseModel


class ScenarioRequest(BaseModel):
    user_id: Optional[str] = None
    current_features: Dict[str, Any]
    changes: Dict[str, Any]


class ScenarioResponse(BaseModel):
    before: Dict[str, Any]
    after: Dict[str, Any]
    improvement: int
    disclaimer: str
