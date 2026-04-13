from fastapi import APIRouter, HTTPException, Depends
from passlib.context import CryptContext
from pydantic import BaseModel
import sqlite3
from db import get_db
from schemas.user import UserCreate, UserOut

router = APIRouter()

# bcrypt password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class LoginRequest(BaseModel):
    username: str
    password: str


# -------------------------
# REGISTER
# -------------------------
@router.post("/register", response_model=UserOut)
def register(user: UserCreate, conn=Depends(get_db)):
    try:
        cur = conn.cursor()

        # check duplicate user
        cur.execute(
            "SELECT id FROM users WHERE username = ? OR email = ?",
            (user.username, user.email)
        )
        if cur.fetchone():
            raise HTTPException(
                status_code=400,
                detail="Username or email already registered"
            )

        # FIX: bcrypt safe password limit check
        password_bytes = user.password.encode("utf-8")
        if len(password_bytes) > 72:
            raise HTTPException(
                status_code=400,
                detail="Password too long (bcrypt supports max 72 bytes)"
            )

        # hash password
        hashed_password = pwd_context.hash(user.password)

        # insert user
        cur.execute(
            "INSERT INTO users (username, email, role, password_hash) VALUES (?, ?, ?, ?)",
            (user.username, user.email, user.role, hashed_password)
        )

        user_id = cur.lastrowid
        conn.commit()

        # return created user
        cur.execute(
            "SELECT id, username, email, role FROM users WHERE id = ?",
            (user_id,)
        )
        row = cur.fetchone()

        return UserOut(**dict(row))

    except sqlite3.IntegrityError:
        conn.rollback()
        raise HTTPException(status_code=400, detail="User already exists")

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")


# -------------------------
# LOGIN
# -------------------------
@router.post("/login")
def login(credentials: LoginRequest, conn=Depends(get_db)):
    try:
        cur = conn.cursor()

        cur.execute(
            "SELECT id, username, email, role, password_hash FROM users WHERE username = ?",
            (credentials.username,)
        )
        row = cur.fetchone()

        if not row:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        # verify password
        if not pwd_context.verify(credentials.password, row["password_hash"]):
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

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")