from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from security import get_current_user
import uuid
import time

router = APIRouter(prefix="/auth", tags=["Auth"])

class LoginRequest(BaseModel):
    email: str
    password: str

DEMO_USERS = {
    "admin@company.com": {"password": "admin123", "role": "admin", "id": 1, "name": "Admin User"},
    "john@company.com": {"password": "employee123", "role": "employee", "id": 2, "name": "John Doe"}
}

@router.post("/login")
async def login(credentials: LoginRequest):
    user_data = DEMO_USERS.get(credentials.email)
    if not user_data or user_data["password"] != credentials.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Mock JWT token (simple UUID)
    token = str(uuid.uuid4())
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user_data["id"],
            "name": user_data["name"],
            "role": user_data["role"],
            "email": credentials.email
        }
    }
