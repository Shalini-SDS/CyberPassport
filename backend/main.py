import os
from contextlib import asynccontextmanager
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from database.connection import close_mongo_connection, connect_to_mongo
from routes import assessment, auth, dashboard, health, history, passport, prediction, recommendations, scenarios, users
from services.prediction import get_prediction_service

load_dotenv(dotenv_path=Path(__file__).resolve().parent / '.env')


@asynccontextmanager
async def lifespan(app: FastAPI):
    connect_to_mongo()
    get_prediction_service()
    yield
    close_mongo_connection()


app = FastAPI(
    title="CyberPassport API",
    description="AI-powered cybersecurity risk assessment and digital trust passport backend.",
    version="1.0.0",
    lifespan=lifespan,
)

frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
allowed_origins = {
    frontend_url,
    "http://localhost:5173",
    "https://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://localhost:8443",
    "https://localhost:8443",
    "http://127.0.0.1:8443",
}

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(allowed_origins),
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


@app.exception_handler(RuntimeError)
async def runtime_error_handler(_: Request, exc: RuntimeError):
    return JSONResponse(status_code=503, content={"detail": str(exc)})


@app.exception_handler(ValueError)
async def value_error_handler(_: Request, exc: ValueError):
    return JSONResponse(status_code=422, content={"detail": str(exc)})


app.include_router(health.router)
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(assessment.router)
app.include_router(prediction.router)
app.include_router(recommendations.router)
app.include_router(history.router)
app.include_router(dashboard.router)
app.include_router(scenarios.router)
app.include_router(passport.router)
app.mount("/uploads", StaticFiles(directory=Path(__file__).resolve().parent / "uploads", check_dir=False), name="uploads")
