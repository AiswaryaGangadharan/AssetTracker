from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

# Normalize DATABASE_URL for SQLAlchemy 2.0+ and cloud providers
SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL
if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Engine configuration with pooling logic for stability in production
if "sqlite" in SQLALCHEMY_DATABASE_URL:
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, 
        connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        pool_pre_ping=True,  # Checks connection validity before each request
        pool_recycle=3600,   # Recycle connections every hour
        connect_args={"connect_timeout": 10}  # Prevent hanging on initial connect
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
