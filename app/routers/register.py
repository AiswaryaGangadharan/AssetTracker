from fastapi import APIRouter, HTTPException, Depends
from passlib.context import CryptContext
from pydantic import BaseModel
import sqlite3
from db import get_db
from schemas.user import UserCreate, UserOut

router = APIRouter()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def safe_truncate_password(password: str) -> str:
    """Truncate password to bcrypt 72-byte limit safely."""
    password_bytes = password.encode("utf-8")
    if len(password_bytes) > 72:
        # Truncate to 72 bytes worth of characters
        truncated_bytes = password_bytes[:72]
        return truncated_bytes.decode("utf-8", errors="ignore")
    return password

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/register", response_model=UserOut)
def register(user: UserCreate, conn = Depends(get_db)):
    try:
        safe_password = safe_truncate_password(user.password)
        hashed_password = pwd_context.hash(safe_password)
        
        cur = conn.cursor()
        cur.execute("SELECT id FROM users WHERE username = ? OR email = ?", (user.username, user.email))
        if cur.fetchone():
            raise HTTPException(status_code=400, detail="Username or email already registered")
        
        cur.execute(
            "INSERT INTO users (username, email, role, password_hash) VALUES (?, ?, ?, ?)",
            (user.username, user.email, user.role, hashed_password)
        )
        user_id = cur.lastrowid
        conn.commit()
        
        cur.execute("SELECT id, username, email, role FROM users WHERE id = ?", (user_id,))
        row = cur.fetchone()
        return UserOut(**dict(row))
    except Exception as e:
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@router.post("/login")
def login(credentials: LoginRequest, conn = Depends(get_db)):
    try:
        safe_password = safe_truncate_password(credentials.password)
        
        cur = conn.cursor()
        cur.execute("SELECT id, username, email, role, password_hash FROM users WHERE username = ?", (credentials.username,))
        row = cur.fetchone()
        if not row or not pwd_context.verify(safe_password, row['password_hash']):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        import uuid
        token = str(uuid.uuid4())
        
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": row["id"],
                "username": row["username"],
                "email": row["email"],
                "role": row["role"]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")
