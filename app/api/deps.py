from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from app.core.config import settings
from app.db.database import get_db
from sqlalchemy.orm import Session
from app.models.domain import User
from enum import Enum

security = HTTPBearer()

# Permission mapping (moved from mock_db for now)
ROLE_PERMISSIONS = {
    "admin": [
        "view:dashboard", "view:all_assets", "view:my_gear", 
        "manage:users", "delete:asset", "create:asset", 
        "assign:asset", "revoke:asset"
    ],
    "employee": [
        "view:dashboard", "view:my_gear", "request:asset"
    ],
}

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid authentication token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication token")
    
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    
    # Return as a dict for compatibility with existing route logic (or refactor later)
    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "role": user.role,
        "initials": user.initials
    }

def require_permission(required_permission: str):
    async def permission_checker(current_user: dict = Depends(get_current_user)):
        user_role = current_user.get("role")
        if not user_role:
            raise HTTPException(status_code=403, detail="User has no role assigned")
        
        permissions = ROLE_PERMISSIONS.get(user_role, [])
        if required_permission not in permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission denied: {required_permission} required"
            )
        
        return current_user
    return permission_checker
