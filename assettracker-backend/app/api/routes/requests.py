from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.domain import Request, User
from app.api.deps import get_current_user, require_permission
from app.db.mock_db import Role, Permission # Keep for enums

router = APIRouter()

require_manage_users = require_permission(Permission.MANAGE_USERS) 

@router.get("")
async def get_requests(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_role = current_user.get("role")
    user_id = current_user.get("id")
    
    if user_role == Role.ADMIN:
        requests = db.query(Request).all()
    else:
        requests = db.query(Request).filter(Request.user_id == user_id).all()
    
    return {"requests": requests}

@router.post("")
async def create_request(
    payload: dict, 
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_id = f"REQ-{db.query(Request).count() + 1:03d}"
    new_req = Request(
        id=new_id,
        user_id=current_user["id"],
        asset_type=payload.get("type"),
        reason=payload.get("reason"),
        status="pending"
    )
    db.add(new_req)
    db.commit()
    db.refresh(new_req)
    return {"request": new_req, "message": "Request submitted successfully"}

@router.post("/{req_id}/approve")
async def approve_request(
    req_id: str, 
    current_user: dict = Depends(require_manage_users),
    db: Session = Depends(get_db)
):
    req = db.query(Request).filter(Request.id == req_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    
    req.status = "approved"
    db.commit()
    return {"request": req, "message": "Request approved"}

@router.post("/{req_id}/reject")
async def reject_request(
    req_id: str, 
    current_user: dict = Depends(require_manage_users),
    db: Session = Depends(get_db)
):
    req = db.query(Request).filter(Request.id == req_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    
    req.status = "rejected"
    db.commit()
    return {"request": req, "message": "Request rejected"}
