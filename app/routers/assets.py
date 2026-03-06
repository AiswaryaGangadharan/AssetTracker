from fastapi import APIRouter
from app.security import RequirePrivilege

router = APIRouter()

@router.post("/")
def create_asset(permission = RequirePrivilege("create:asset")):
    return {"message": "Asset created"}

@router.delete("/{asset_id}")
def delete_asset(asset_id: int, permission = RequirePrivilege("delete:asset")):
    return {"message": f"Asset {asset_id} deleted"}