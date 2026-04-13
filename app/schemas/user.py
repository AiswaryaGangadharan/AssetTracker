from pydantic import BaseModel
from typing import Optional

class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    role: str = 'employee'

class UserOut(BaseModel):
    id: int
    username: str
    email: str
    role: str

class UserLogin(BaseModel):
    username: str
    password: str
