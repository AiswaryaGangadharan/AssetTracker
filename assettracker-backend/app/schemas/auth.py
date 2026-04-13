from pydantic import BaseModel
from typing import Optional

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

class LoginRequest(BaseModel):
    email: str = None
    username: str = None
    password: str

class RegisterRequest(BaseModel):
    email: str
    username: str
    password: str
    initials: Optional[str] = None
    department: Optional[str] = None
