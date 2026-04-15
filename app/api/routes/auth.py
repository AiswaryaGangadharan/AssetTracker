from fastapi import APIRouter, Depends, HTTPException
from datetime import timedelta
from app.schemas.auth import LoginRequest, Token, RegisterRequest
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.domain import User
from app.api.deps import ROLE_PERMISSIONS, get_current_user
from app.core.config import settings
from app.core.security import create_access_token, get_password_hash, verify_password

router = APIRouter()

@router.post("/register", response_model=Token)
async def register(request: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == request.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
        
    initials = request.initials or "".join([p[0].upper() for p in request.name.split() if p])[:2]
    
    user = User(
        email=request.email,
        name=request.name,
        password_hash=get_password_hash(request.password),
        role=request.role,
        initials=initials,
        department=request.department
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={
            "sub": user.email,
            "id": user.id,
            "role": user.role,
            "permissions": ROLE_PERMISSIONS.get(user.role, [])
        },
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user.to_dict()
    }

@router.post("/login", response_model=Token)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
        
    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={
            "sub": user.email,
            "id": user.id,
            "role": user.role,
            "permissions": ROLE_PERMISSIONS.get(user.role, [])
        },
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user.to_dict()
    }

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return current_user

