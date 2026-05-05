from fastapi import APIRouter, Depends, HTTPException
from datetime import timedelta, datetime
from app.schemas.auth import LoginRequest, Token, RegisterRequest
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.database import get_db
from app.models.domain import User
from app.api.deps import ROLE_PERMISSIONS, get_current_user
from app.core.config import settings
from app.core.security import create_access_token, get_password_hash, verify_password

router = APIRouter()

@router.post("/register", response_model=Token)
async def register(request: RegisterRequest, db: Session = Depends(get_db)):
    email = request.email.strip().lower()
    name = request.name.strip()
    print(f"[{datetime.now().isoformat()}] DEBUG: REGISTER ATTEMPT: {email}")

    if db.query(User).filter(func.lower(User.email) == email).first():
        print(f"[{datetime.now().isoformat()}] DEBUG: REGISTER FAILED (Email exists): {email}")
        raise HTTPException(status_code=400, detail="Email already registered")
        
    initials = request.initials or "".join([p[0].upper() for p in name.split() if p])[:2]
    
    user = User(
        email=email,
        name=name,
        password_hash=get_password_hash(request.password),
        role=request.role,
        initials=initials,
        department=request.department.strip() if request.department else None
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    print(f"[{datetime.now().isoformat()}] DEBUG: REGISTER SUCCESS: {email}")
    
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
    email = request.email.strip().lower()
    print(f"[{datetime.now().isoformat()}] DEBUG: LOGIN ATTEMPT: {email}")
    
    user = db.query(User).filter(func.lower(User.email) == email).first()
    
    if not user:
        print(f"[{datetime.now().isoformat()}] DEBUG: User NOT FOUND: {email}")
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    print(f"[{datetime.now().isoformat()}] DEBUG: User found: {user.email}")
    
    if not user.password_hash:
        print(f"[{datetime.now().isoformat()}] ERROR: Password hash missing for user: {user.email}")
        raise Exception("Password hash missing in DB")

    if not verify_password(request.password, user.password_hash):
        print(f"[{datetime.now().isoformat()}] DEBUG: Password verification FAILED for: {user.email}")
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    print(f"[{datetime.now().isoformat()}] DEBUG: Password verification SUCCESS for: {user.email}")
    
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
