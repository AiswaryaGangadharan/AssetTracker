from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.api import api_router
from app.core.config import settings
from datetime import datetime
from app.db.database import engine, Base
from app.models import domain # Ensure models are imported to be registered with Base

from contextlib import asynccontextmanager
from app.db.init_db import init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic: Initialize database and seed data
    print("Starting up: Initializing database...")
    init_db()
    yield
    # Shutdown logic (if any)
    print("Shutting down...")

app = FastAPI(
    title=settings.PROJECT_NAME, 
    version=settings.VERSION,
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}
