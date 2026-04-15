from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.api import api_router
from app.core.config import settings
from datetime import datetime
from app.db.database import engine, Base
from app.models import domain # Ensure models are imported to be registered with Base

import asyncio
from contextlib import asynccontextmanager
from app.db.init_db import init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic: Initialize database and seed data in the background
    print(f"[{datetime.now().isoformat()}] INFO: Application starting up. Scheduling background initialization...")
    asyncio.create_task(asyncio.to_thread(init_db))
    yield
    # Shutdown logic (if any)
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
    "http://localhost:3001",
    "http://127.0.0.1:3001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
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
        "timestamp": datetime.utcnow()
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}
