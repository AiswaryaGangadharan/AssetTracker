from pydantic import BaseModel
from typing import Optional
from typing import Literal

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    email: str
    name: str # Renamed from username
    password: str
    role: Literal["admin", "employee"] = "employee"
    initials: Optional[str] = None
    department: Optional[str] = None

