from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.domain import User
from app.api.deps import get_current_user, require_permission
from app.db.mock_db import Permission

router = APIRouter()
require_manage_users = require_permission(Permission.MANAGE_USERS)

@router.get("")
async def get_users(
    current_user: dict = Depends(require_manage_users),
    db: Session = Depends(get_db)
):
    users = db.query(User).all()
    return {
        "users": [
            {
                "id": u.id,
                "email": u.email,
                "name": u.name,
                "role": u.role,
                "initials": u.initials,
                "department": u.department or "General",
                "asset_count": len(u.assets)
            } for u in users
        ]
    }

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {"user": current_user}
