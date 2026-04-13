from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "AssetTracker API"
    VERSION: str = "1.0.0"
    SECRET_KEY: str = "your-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Database Configuration
    DATABASE_URL: str = "sqlite:///./asset_tracker.db"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
