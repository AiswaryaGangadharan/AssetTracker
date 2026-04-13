from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, List
from datetime import datetime
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.domain import Asset, ActivityLog, User
from app.api.deps import get_current_user, require_permission, ROLE_PERMISSIONS
from app.db.mock_db import Role, Permission # Keep roles/perms for now, or migrate them too

router = APIRouter()

require_view_all = require_permission(Permission.VIEW_ALL_ASSETS)
require_delete = require_permission(Permission.DELETE_ASSET)
require_create = require_permission(Permission.CREATE_ASSET)
require_assign = require_permission(Permission.ASSIGN_ASSET)
require_revoke = require_permission(Permission.REVOKE_ASSET)
require_request = require_permission(Permission.REQUEST_ASSET)

@router.get("")
async def get_assets(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_role = current_user.get("role")
    user_id = current_user.get("id")
    
    if user_role == Role.ADMIN:
        assets = db.query(Asset).all()
    else:
        assets = db.query(Asset).filter(Asset.assigned_to == user_id).all()
    
    return {"assets": assets}

@router.get("/all")
async def get_all_assets(
    current_user: dict = Depends(require_view_all),
    db: Session = Depends(get_db)
):
    assets = db.query(Asset).all()
    return {"assets": assets}

@router.delete("/{asset_id}")
async def delete_asset(
    asset_id: str, 
    current_user: dict = Depends(require_delete),
    db: Session = Depends(get_db)
):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    db.delete(asset)
    db.commit()
    return {"message": f"Asset {asset_id} deleted successfully"}

@router.post("")
async def create_asset(
    payload: dict, 
    current_user: dict = Depends(require_create),
    db: Session = Depends(get_db)
):
    # Generate ID (simulating AST-001 logic or using UUID)
    count = db.query(Asset).count()
    new_id = f"AST-{count + 1:03d}"
    
    new_asset = Asset(
        id=new_id,
        name=payload.get("name"),
        type=payload.get("type"),
        status="available",
        date=datetime.now().date(),
        notes=payload.get("notes")
    )
    db.add(new_asset)
    
    # Add Log
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
    return {"asset": new_asset, "message": "Asset created successfully"}


@router.post("/{asset_id}/assign")
async def assign_asset(
    asset_id: str, 
    payload: dict, 
    current_user: dict = Depends(require_assign),
    db: Session = Depends(get_db)
):
    user_id = payload.get("user_id")
    user_name = payload.get("user_name") # From frontend for status message
    
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    if asset.status == "maintenance":
        raise HTTPException(status_code=400, detail="Cannot assign asset that is in maintenance")
    
    asset.assigned_to = user_id
    asset.status = "assigned"
    asset.date = datetime.now().date()
    
    # Add Log
    new_log = ActivityLog(
        id=f"LOG-{db.query(ActivityLog).count() + 1:03d}",
        asset_id=asset_id,
        action="Assigned",
        user_id=current_user["id"],
        notes=f"Assigned to {user_name}"
    )
    db.add(new_log)
    
    db.commit()
    return {"asset": asset, "message": f"Asset assigned to {user_name}"}


@router.post("/{asset_id}/revoke")
async def revoke_asset(
    asset_id: str, 
    current_user: dict = Depends(require_revoke),
    db: Session = Depends(get_db)
):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    asset.assigned_to = None
    asset.status = "available"
    
    # Add Log
    new_log = ActivityLog(
        id=f"LOG-{db.query(ActivityLog).count() + 1:03d}",
        asset_id=asset_id,
        action="Revoked",
        user_id=current_user["id"],
        notes="Asset returned/revoked"
    )
    db.add(new_log)
    
    db.commit()
    return {"asset": asset, "message": "Asset revoked successfully"}

