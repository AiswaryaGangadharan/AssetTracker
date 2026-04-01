from fastapi import Depends, HTTPException, status, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
import jwt
from typing import Optional, Dict, Any

security = HTTPBearer()

class User(BaseModel):
    id: int
    email: str
    role: str

ROLE_PERMISSIONS = {
    "admin": [
        "view:dashboard", "view:all_assets", "view:my_gear", 
        "manage:users", "delete:asset", "create:asset"
    ],
    "employee": [
        "view:dashboard", "view:my_gear"
    ]
}

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    """Mock JWT decode - replace with real SECRET_KEY"""
    try:
        # Demo tokens for testing
        token_payloads = {
            "admin@company.com": {"id": 1, "email": "admin@company.com", "role": "admin"},
            "john@company.com": {"id": 2, "email": "john@company.com", "role": "employee"}
        }
        
        # Extract email from basic auth or mock
        if credentials:
            # Simulate token decode (in real: jwt.decode(credentials.credentials, SECRET_KEY))
            for email, payload in token_payloads.items():
                if email in credentials.credentials:
                    return User(**payload)
        
        raise HTTPException(status_code=401, detail="Invalid credentials")
    except:
        raise HTTPException(status_code=401, detail="Invalid token")

def RequirePrivilege(required_role: str):
    """RBAC decorator stub - check role has permission"""
    def decorator(func):
        async def wrapper(*args, **kwargs):
            user: User = kwargs.get("current_user")
            if user and user.role == required_role:
                return await func(*args, **kwargs)
            raise HTTPException(status_code=403, detail="Insufficient privileges")
        return wrapper
    return decorator
