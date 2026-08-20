import os
from functools import lru_cache
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
from pymongo import ASCENDING, MongoClient
from pymongo.database import Database
from pymongo.errors import PyMongoError, ServerSelectionTimeoutError

from database.collections import (
    ASSESSMENTS,
    RECOMMENDATIONS,
    RISK_HISTORY,
    SCENARIO_RESULTS,
    USERS,
)

load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / '.env')


class MongoState:
    def __init__(self) -> None:
        self.client: Optional[MongoClient] = None
        self.db: Optional[Database] = None
        self.error: Optional[str] = None

    @property
    def available(self) -> bool:
        return self.db is not None and self.error is None


state = MongoState()


def connect_to_mongo() -> MongoState:
    uri = os.getenv("MONGODB_URI")
    db_name = os.getenv("DATABASE_NAME", "cyberpassport")
    if not uri:
        state.error = "MONGODB_URI is not configured. Database-backed endpoints will return a service-unavailable response."
        return state

    try:
        state.client = MongoClient(uri, serverSelectionTimeoutMS=5000)
        state.client.admin.command("ping")
        state.db = state.client[db_name]
        create_indexes(state.db)
        state.error = None
    except (PyMongoError, ServerSelectionTimeoutError) as exc:
        state.db = None
        state.error = f"MongoDB connection failed: {exc}"
    return state


def close_mongo_connection() -> None:
    if state.client:
        state.client.close()


def get_database() -> Database:
    if state.db is None:
        raise RuntimeError(state.error or "MongoDB is not connected")
    return state.db


def create_indexes(db: Database) -> None:
    db[USERS].create_index([("email", ASCENDING)], unique=True)
    db[ASSESSMENTS].create_index([("user_id", ASCENDING), ("created_at", ASCENDING)])
    db[RISK_HISTORY].create_index([("user_id", ASCENDING), ("date", ASCENDING)])
    db[RECOMMENDATIONS].create_index([("user_id", ASCENDING), ("completed", ASCENDING)])
    db[SCENARIO_RESULTS].create_index([("user_id", ASCENDING), ("created_at", ASCENDING)])
    db["passports"].create_index([("user_id", ASCENDING)], unique=True)
    db["passports"].create_index([("passport_id", ASCENDING)], unique=True, sparse=True)


@lru_cache
def db_status() -> dict:
    return {"available": state.available, "error": state.error}
