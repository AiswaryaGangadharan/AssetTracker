from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.database import get_db
from app.models.domain import Asset, User
from app.api.deps import get_current_user
from app.db.mock_db import Role # Keep role enum for check

router = APIRouter()

@router.get("")
async def get_dashboard(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_role = current_user.get("role")
    user_id = current_user.get("id")
    
    if user_role == Role.ADMIN:
        total = db.query(Asset).count()
        active = db.query(Asset).filter(Asset.status == "active").count()
        employees = db.query(Asset.assigned_to).distinct().filter(Asset.assigned_to.isnot(None)).count()
        
        return {
            "stats": {
                "total_assets": total,
                "active_assets": active,
                "employees": employees,
                "department_assets": total,
            }
        }
    else:
        my_assets_count = db.query(Asset).filter(Asset.assigned_to == user_id).count()
        my_active_count = db.query(Asset).filter(Asset.assigned_to == user_id, Asset.status == "active").count()
        department_count = db.query(Asset).count()
        
        return {
            "stats": {
                "total_assets": my_assets_count,
                "active_assets": my_active_count,
                "employees": 1,
                "department_assets": department_count,
            }
        }
