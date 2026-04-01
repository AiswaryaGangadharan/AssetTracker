from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, List
from datetime import datetime
from app.api.deps import get_current_user, require_permission
from app.db.mock_db import Role, Permission, ASSETS_DB

router = APIRouter()

require_view_all = require_permission(Permission.VIEW_ALL_ASSETS)
require_delete = require_permission(Permission.DELETE_ASSET)
require_create = require_permission(Permission.CREATE_ASSET)

@router.get("")
async def get_assets(current_user: dict = Depends(get_current_user)):
    user_role = current_user.get("role")
    user_id = current_user.get("id")
    
    if user_role == Role.ADMIN:
        return {"assets": ASSETS_DB}
    else:
        my_assets = [asset for asset in ASSETS_DB if asset["assigned_to"] == user_id]
        return {"assets": my_assets}

@router.get("/all")
async def get_all_assets(current_user: dict = Depends(require_view_all)):
    return {"assets": ASSETS_DB}

@router.delete("/{asset_id}")
async def delete_asset(asset_id: str, current_user: dict = Depends(require_delete)):
    global ASSETS_DB
    asset = next((a for a in ASSETS_DB if a["id"] == asset_id), None)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    ASSETS_DB[:] = [a for a in ASSETS_DB if a["id"] != asset_id]
    return {"message": f"Asset {asset_id} deleted successfully"}

@router.post("")
async def create_asset(asset: dict, current_user: dict = Depends(require_create)):
    new_id = f"AST-{len(ASSETS_DB) + 1:03d}"
    new_asset = {
        "id": new_id,
        **asset,
        "date": datetime.now().strftime("%Y-%m-%d"),
    }
    ASSETS_DB.append(new_asset)
    return {"asset": new_asset, "message": "Asset created successfully"}
