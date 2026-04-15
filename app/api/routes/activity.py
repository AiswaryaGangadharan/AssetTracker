from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.db.database import get_db
from app.models.domain import ActivityLog, Asset, User
from app.api.deps import get_current_user
# Removed mock_db - string roles

router = APIRouter()

@router.get("")
async def get_activity_logs(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_role = current_user.get("role")
    user_id = current_user.get("id")
    
    if user_role == 'admin':
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
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    asset_logs = db.query(ActivityLog).filter(ActivityLog.asset_id == asset_id).order_by(desc(ActivityLog.timestamp)).all()
    
    logs_with_users = []
    for log in asset_logs:
        user = db.query(User).filter(User.id == log.user_id).first()
        status = "active" if log.action == "Assigned" else "returned" if log.action == "Revoked" else log.action
        logs_with_users.append({
            "id": log.id,
            "action": log.action,
            "status": status,
            "user_name": user.username if user else "Unknown",
            "user_id": log.user_id,
            "timestamp": log.timestamp.isoformat() if log.timestamp else None,
            "notes": log.notes
        })
    
    if current_user.get("role") != 'admin':
        is_involved = db.query(ActivityLog).filter(
            ActivityLog.asset_id == asset_id, 
            ActivityLog.user_id == current_user["id"]
        ).first() is not None
        if not is_involved:
            return {"logs": [], "message": "No permission to view logs for this asset"}
    
    return {"logs": logs_with_users}
