from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from app.api.api import api_router
from app.core.config import settings
from datetime import datetime
from app.db.database import engine, Base, SessionLocal
from app.models import domain # Ensure models are imported to be registered with Base

import asyncio
from contextlib import asynccontextmanager
from app.db.init_db import init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: SYNCHRONOUS init to fail-fast on bad DB
    print(f"[{datetime.now().isoformat()}] INFO: Application starting up...")
    init_db()  # Now sync, blocks until DB ready
    yield
    print(f"[{datetime.now().isoformat()}] INFO: Application shutting down.")

app = FastAPI(
    title=settings.PROJECT_NAME, 
    version=settings.VERSION,
    lifespan=lifespan
)

# CORS configuration
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://assettracker-frontend.vercel.app",
    "https://assettracker-frontend-git-main-aiswaryagangadharans-projects.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(api_router, prefix="/api")

@app.get("/")
async def root():
    return {
        "status": "running", 
        "service": settings.PROJECT_NAME, 
        "version": settings.VERSION,
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
async def health_check():
    try:
        # Test DB connectivity
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        db_status = "connected"
    except:
        db_status = "unavailable - check DATABASE_URL"
    
    return {
        "status": "healthy" if db_status == "connected" else "degraded", 
        "db": db_status,
        "timestamp": datetime.now().isoformat()
    }

