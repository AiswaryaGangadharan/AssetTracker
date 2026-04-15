from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, List
from datetime import datetime
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.domain import Asset, ActivityLog, User
from app.api.deps import get_current_user, require_permission, ROLE_PERMISSIONS
# Removed mock_db imports - use string roles

router = APIRouter()

require_view_all = require_permission("view:all_assets")
require_delete = require_permission("delete:asset")
require_create = require_permission("create:asset")
require_assign = require_permission("assign:asset")
require_revoke = require_permission("revoke:asset")
require_request = require_permission("request:asset")

@router.get("")
async def get_assets(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from sqlalchemy.orm import joinedload
    user_role = current_user.get("role")
    user_id = current_user.get("id")
    
    if user_role == 'admin':
        assets = db.query(Asset).options(joinedload(Asset.assignee)).all()
    else:
        # Employees only see their assigned assets
        assets = db.query(Asset).filter(Asset.assignee_id == user_id).options(joinedload(Asset.assignee)).all()
    
    return {"assets": [a.to_dict() for a in assets]}

@router.post("")
async def create_asset(
    payload: dict, 
    current_user: dict = Depends(require_create),
    db: Session = Depends(get_db)
):
    count = db.query(Asset).count()
    new_id = f"AST-{count + 1:03d}"
    
    new_asset = Asset(
        id=new_id,
        name=payload.get("name"),
        type=payload.get("type"),
        status="available",
        notes=payload.get("notes")
    )
    db.add(new_asset)
    
    new_log = ActivityLog(
        id=f"LOG-{db.query(ActivityLog).count() + 1:03d}",
        asset_id=new_id,
        action="Created",
        user_id=current_user["id"],
        notes="Asset added to system"
    )
    db.add(new_log)
    
    db.commit()
    db.refresh(new_asset)
    return {"asset": new_asset.to_dict(), "message": "Asset created successfully"}

@router.post("/{asset_id}/assign")
async def assign_asset(
    asset_id: str, 
    payload: dict, 
    current_user: dict = Depends(require_assign),
    db: Session = Depends(get_db)
):
    user_id = payload.get("user_id")
    
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if asset.status == "maintenance":
        raise HTTPException(status_code=400, detail="Cannot assign asset that is in maintenance")
    
    # 1. Update Asset
    asset.assignee_id = user_id
    asset.status = "assigned"
    asset.last_assigned_date = datetime.now()
    
    # 2. Create Assignment Record (History)
    from app.models.domain import Assignment
    assignment_id = f"ASGN-{db.query(Assignment).count() + 1:03d}"
    new_assignment = Assignment(
        id=assignment_id,
        asset_id=asset_id,
        user_id=user_id,
        assigned_date=datetime.now(),
        status="active"
    )
    db.add(new_assignment)
    
    # 3. Add Log
    new_log = ActivityLog(
        id=f"LOG-{db.query(ActivityLog).count() + 1:03d}",
        asset_id=asset_id,
        action="Assigned",
        user_id=current_user["id"],
        notes=f"Assigned to {user.name}"
    )
    db.add(new_log)
    
    db.commit()
    db.refresh(asset)
    return {"asset": asset.to_dict(), "message": f"Asset assigned to {user.name}"}

@router.post("/{asset_id}/revoke")
async def revoke_asset(
    asset_id: str, 
    current_user: dict = Depends(require_revoke),
    db: Session = Depends(get_db)
):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    # Update current assignment status to 'returned'
    from app.models.domain import Assignment
    assignment = db.query(Assignment).filter(Assignment.asset_id == asset_id, Assignment.status == 'active').first()
    if assignment:
        assignment.status = 'returned'
        assignment.return_date = datetime.now()
    
    asset.assignee_id = None
    asset.status = "available"
    
    new_log = ActivityLog(
        id=f"LOG-{db.query(ActivityLog).count() + 1:03d}",
        asset_id=asset_id,
        action="Revoked",
        user_id=current_user["id"],
        notes="Asset returned/revoked"
    )
    db.add(new_log)
    
    db.commit()
    db.refresh(asset)
    return {"asset": asset.to_dict(), "message": "Asset revoked successfully"}


