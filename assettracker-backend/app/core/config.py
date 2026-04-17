from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "AssetTracker API"
    VERSION: str = "1.0.0"
    SECRET_KEY: str = "09f42b5d6e7f8a9c0b1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b-change-in-env"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
# Database Configuration
    DATABASE_URL: str = "sqlite+aiosqlite:///./asset_tracker.db?_check_same_thread=False" # Local demo fallback
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        env_file = ".env"
        case_sensitive = True

settings = Settings()
