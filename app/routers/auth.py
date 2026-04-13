from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import uuid

router = APIRouter(prefix="/auth", tags=["Auth"])


class LoginRequest(BaseModel):
    email: str
    password: str


# Demo users (mock database)
DEMO_USERS = {
    "admin@company.com": {
        "password": "admin123",
        "role": "admin",
        "id": 1,
        "name": "Admin User"
    },
    "john@company.com": {
        "password": "employee123",
        "role": "employee",
        "id": 2,
        "name": "John Doe"
    }
}


@router.post("/login")
async def login(credentials: LoginRequest):
    user = DEMO_USERS.get(credentials.email)

    # validate user
    if not user or user["password"] != credentials.password:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    # generate mock token
    token = str(uuid.uuid4())

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "name": user["name"],
            "role": user["role"],
            "email": credentials.email
        }
    }