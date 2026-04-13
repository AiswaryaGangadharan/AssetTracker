from fastapi import APIRouter, HTTPException, Depends
from passlib.context import CryptContext
from pydantic import BaseModel
from typing import Optional
from db import get_db
from schemas.user import UserCreate, UserOut
import sqlite3

router = APIRouter()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/register", response_model=UserOut)
def register(user: UserCreate, conn: sqlite3.Connection = Depends(get_db)):
    # Check if user exists
    cur = conn.cursor()
    cur.execute("SELECT id FROM users WHERE username = ? OR email = ?", (user.username, user.email))
    if cur.fetchone():
        raise HTTPException(status_code=400, detail="Username or email already registered")
    
    hashed_password = pwd_context.hash(user.password)
    
    cur.execute(
        "INSERT INTO users (username, email, role, password_hash) VALUES (?, ?, ?, ?)",
        (user.username, user.email, user.role, hashed_password)
    )
    user_id = cur.lastrowid
    conn.commit()
    
    cur.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    row = cur.fetchone()
    return UserOut(id=row['id'], username=row['username'], email=row['email'], role=row['role'])

@router.post("/login")
def login(credentials: LoginRequest, conn: sqlite3.Connection = Depends(get_db)):
    cur = conn.cursor()
    cur.execute("SELECT * FROM users WHERE username = ?", (credentials.username,))
    row = cur.fetchone()
    if not row or not pwd_context.verify(credentials.password, row['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Mock token
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
