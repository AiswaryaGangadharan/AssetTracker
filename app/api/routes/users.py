from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.domain import User
from app.api.deps import get_current_user, require_permission
router = APIRouter()
require_manage_users = require_permission("manage:users")


@router.get("")
async def get_users(
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_manage_users)
):
    # Fetch all users with role 'employee' for the admin list
    users = db.query(User).filter(User.role == "employee").all()
    return {
        "users": [
            {
                "id": u.id,
                "email": u.email,
                "name": u.name,
                "role": u.role,
                "initials": u.initials,
                "department": u.department or "General",
                "asset_count": len(u.assets),
                "status": "Active"
            } for u in users
        ]
    }



@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {"user": current_user}
