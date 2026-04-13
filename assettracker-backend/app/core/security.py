from datetime import datetime, timedelta
from typing import Optional
from jose import jwt
import hashlib
from passlib.context import CryptContext
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    # Bypass bcrypt 72-byte limit by hashing with SHA-256 first
    hashed = hashlib.sha256(password.encode('utf-8')).hexdigest()
    return pwd_context.hash(hashed)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    hashed = hashlib.sha256(plain_password.encode('utf-8')).hexdigest()
    return pwd_context.verify(hashed, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt
