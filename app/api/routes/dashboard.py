from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.database import get_db
from app.models.domain import Asset, User
from app.api.deps import get_current_user

router = APIRouter()

@router.get("")
async def get_dashboard(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_role = current_user.get("role")
    user_id = current_user.get("id")
    
    if user_role == "admin":
        total = db.query(Asset).count()
        assigned = db.query(Asset).filter(Asset.status == "assigned").count()
        employees = db.query(User).filter(User.role == "employee").count()
        maintenance = db.query(Asset).filter(Asset.status == "maintenance").count()
        
        return {
            "stats": {
                "total_assets": total,
                "assigned_assets": assigned,
                "total_employees": employees,
                "maintenance_assets": maintenance,
            }
        }
    else:
        my_assets_count = db.query(Asset).filter(Asset.assignee_id == user_id).count()
        department_total = db.query(Asset).count()
        
        return {
            "stats": {
                "total_assets": my_assets_count,
                "assigned_assets": my_assets_count, # for consistency in frontend
                "total_employees": 1,
                "department_assets": department_total,
            }
        }

