from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import sqlite3
from db import get_db
from schemas.user import UserCreate, UserOut

router = APIRouter()

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/register", response_model=UserOut)
def register(user: UserCreate, conn = Depends(get_db)):
    cur = conn.cursor()
    cur.execute("SELECT id FROM users WHERE username = ? OR email = ?", (user.username, user.email))
    if cur.fetchone():
        raise HTTPException(status_code=400, detail="Username or email already registered")
    
    cur.execute(
        "INSERT INTO users (username, email, role, password_hash) VALUES (?, ?, ?, ?)",
        (user.username, user.email, user.role, user.password)  # plain text
    )
    user_id = cur.lastrowid
    conn.commit()
    
    cur.execute("SELECT id, username, email, role FROM users WHERE id = ?", (user_id,))
    row = cur.fetchone()
    return UserOut(**dict(row))

@router.post("/login")
def login(credentials: LoginRequest, conn = Depends(get_db)):
    cur = conn.cursor()
    cur.execute("SELECT id, username, email, role, password_hash FROM users WHERE username = ?", (credentials.username,))
    row = cur.fetchone()
    if not row or row['password_hash'] != credentials.password:
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
