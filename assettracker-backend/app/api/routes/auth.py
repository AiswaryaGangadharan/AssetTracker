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
    if db.query(User).filter((User.email == request.email) | (User.username == request.username)).first():
        raise HTTPException(status_code=400, detail="Username or email already registered")
        
    initials = request.initials or "".join([p[0].upper() for p in request.username.split() if p])[:2]
    
    user = User(
        email=request.email,
        username=request.username,
        password_hash=get_password_hash(request.password),
        role="employee",
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
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.username,  # map username to name so frontend doesn't break
            "role": user.role,
            "initials": user.initials,
        }
    }

@router.post("/login", response_model=Token)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    if not request.email and not request.username:
        raise HTTPException(status_code=400, detail="Must provide email or username")
        
    user = None
    if request.email:
        user = db.query(User).filter(User.email == request.email).first()
    if not user and request.username:
        user = db.query(User).filter(User.username == request.username).first()
        
    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email/username or password")
    
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
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.username, # map username to name so frontend doesn't break
            "role": user.role,
            "initials": user.initials,
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
