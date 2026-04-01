from fastapi import APIRouter, Depends
from app.api.deps import require_permission
from app.db.mock_db import Permission, USERS_DB

router = APIRouter()
require_manage_users = require_permission(Permission.MANAGE_USERS)

@router.get("")
async def get_users(current_user: dict = Depends(require_manage_users)):
    users = [{k: v for k, v in u.items() if k != "password"} for u in USERS_DB.values()]
    return {"users": users}
