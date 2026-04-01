from fastapi import APIRouter, Depends, HTTPException
from datetime import timedelta
from app.schemas.auth import LoginRequest, Token
from app.db.mock_db import USERS_DB, ROLE_PERMISSIONS, pwd_context
from app.core.security import create_access_token
from app.core.config import settings
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/login", response_model=Token)
async def login(request: LoginRequest):
    user = USERS_DB.get(request.email)
    if not user or not pwd_context.verify(request.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={
            "sub": user["email"],
            "id": user["id"],
            "role": user["role"],
            "permissions": ROLE_PERMISSIONS.get(user["role"], [])
        },
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "email": user["email"],
            "name": user["name"],
            "role": user["role"],
            "initials": user["initials"],
        }
    }

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "id": current_user["id"],
        "email": current_user["email"],
        "name": current_user["name"],
        "role": current_user["role"],
        "initials": current_user["initials"],
        "permissions": ROLE_PERMISSIONS.get(current_user["role"], [])
    }
