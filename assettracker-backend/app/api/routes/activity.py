from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.db.database import get_db
from app.models.domain import ActivityLog, Asset, User
from app.api.deps import get_current_user
from app.db.mock_db import Role

router = APIRouter()

@router.get("")
async def get_activity_logs(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_role = current_user.get("role")
    user_id = current_user.get("id")
    
    if user_role == Role.ADMIN:
        logs = db.query(ActivityLog).order_by(desc(ActivityLog.timestamp)).limit(100).all()
    else:
        logs = db.query(ActivityLog).filter(ActivityLog.user_id == user_id).order_by(desc(ActivityLog.timestamp)).all()
    
    return {"logs": logs}

@router.get("/{asset_id}")
async def get_asset_logs(
    asset_id: str, 
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    asset_logs = db.query(ActivityLog).filter(ActivityLog.asset_id == asset_id).order_by(desc(ActivityLog.timestamp)).all()
    
    if current_user.get("role") != Role.ADMIN:
        # Security check: did the employee ever interact with this asset?
        is_involved = db.query(ActivityLog).filter(
            ActivityLog.asset_id == asset_id, 
            ActivityLog.user_id == current_user["id"]
        ).first() is not None
        
        if not is_involved:
            return {"logs": [], "message": "No permission to view logs for this asset"}
            
    return {"logs": asset_logs}
