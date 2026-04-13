from fastapi import APIRouter, Depends, HTTPException
from typing import List
from schemas.schemas import AssetOut
from security import RequirePrivilege, get_current_user

router = APIRouter(prefix="/assets", tags=["Assets"])

# Mock data from SQL dummy
ALL_ASSETS = [
    {"id": 1, "asset_name": "Dell Laptop", "type": "Hardware", "status": "assigned"},
    {"id": 2, "asset_name": "iPhone", "type": "Hardware", "status": "available"},
]

EMPLOYEE_ASSETS = [  # employee_id=1
    {"id": 1, "asset_name": "Dell Laptop", "type": "Hardware", "status": "assigned"},
]

@router.get("/", response_model=List[AssetOut])
def get_assets(current_user: dict = Depends(get_current_user)): 

    role = current_user.get("role")
    if role == "employee":
        return EMPLOYEE_ASSETS
    return ALL_ASSETS  # admin sees all

# Existing admin delete
def require_admin_role(current_user: dict):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    return True

@router.delete("/{id}", dependencies=[Depends(require_admin_role)])
def delete_asset(id: int):
    return {"message": f"Asset {id} deleted successfully"}

