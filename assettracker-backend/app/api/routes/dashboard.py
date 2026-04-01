from fastapi import APIRouter, Depends
from app.api.deps import get_current_user
from app.db.mock_db import Role, ASSETS_DB

router = APIRouter()

@router.get("")
async def get_dashboard(current_user: dict = Depends(get_current_user)):
    user_role = current_user.get("role")
    user_id = current_user.get("id")
    
    if user_role == Role.ADMIN:
        total = len(ASSETS_DB)
        active = len([a for a in ASSETS_DB if a["status"] == "active"])
        employees = len(set([a["assigned_to"] for a in ASSETS_DB if a["assigned_to"]]))
        
        return {
            "stats": {
                "total_assets": total,
                "active_assets": active,
                "employees": employees,
                "department_assets": total,
            }
        }
    else:
        my_assets = [a for a in ASSETS_DB if a["assigned_to"] == user_id]
        my_active = len([a for a in my_assets if a["status"] == "active"])
        department_count = len(ASSETS_DB)
        
        return {
            "stats": {
                "total_assets": len(my_assets),
                "active_assets": my_active,
                "employees": 1,
                "department_assets": department_count,
            }
        }
