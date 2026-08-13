from datetime import datetime, timezone

from fastapi import APIRouter

from database.collections import SCENARIO_RESULTS
from database.connection import get_database
from schemas.scenario import ScenarioRequest, ScenarioResponse
from services.scenario import simulate

router = APIRouter(prefix="/api/scenario", tags=["Scenario Simulation"])


@router.post("/simulate", response_model=ScenarioResponse, summary="Simulate risk improvement")
def simulate_scenario(payload: ScenarioRequest):
    result = simulate(payload.current_features, payload.changes)
    if payload.user_id:
        get_database()[SCENARIO_RESULTS].insert_one({"user_id": payload.user_id, "current_features": payload.current_features, "changes": payload.changes, "result": result, "created_at": datetime.now(timezone.utc)})
    return result
