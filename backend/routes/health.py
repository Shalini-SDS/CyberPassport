from fastapi import APIRouter

from database.connection import state
from services.prediction import get_prediction_service

router = APIRouter(tags=["Health"])


@router.get("/", summary="API health")
def root():
    return {"status": "ok", "service": "CyberPassport API", "mongodb": state.available}


@router.get("/health", summary="Health endpoint")
@router.get("/api/health", summary="Detailed API health")
def health():
    model_ok = True
    model_error = None
    try:
        service = get_prediction_service()
        model_file = service.model.__class__.__name__
    except Exception as exc:
        model_ok = False
        model_file = None
        model_error = str(exc)
    return {"status": "ok", "mongodb": {"available": state.available, "error": state.error}, "model": {"available": model_ok, "type": model_file, "error": model_error}}
