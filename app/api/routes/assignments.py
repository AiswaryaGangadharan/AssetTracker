from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List
from app.db.database import get_db
from app.api.deps import get_current_user, require_permission
from app.models.domain import Assignment, Asset, User
from app.core.config import settings
from app.schemas.assignment import AssignmentCreate, AssignmentUpdate, AssignmentResponse

router = APIRouter(prefix="/assignments", tags=["assignments"])
require_assign = require_permission("assign:asset")

@router.post("", response_model=AssignmentResponse)
async def create_assignment(
    payload: AssignmentCreate,
    current_user: dict = Depends(require_assign),
    db: Session = Depends(get_db)
):
    # Check asset exists and available
    asset = db.query(Asset).filter(Asset.id == payload.asset_id, Asset.status == "available").first()
    if not asset:
        raise HTTPException(status_code=400, detail="Asset not available for assignment")

    # Create assignment ID
    count = db.query(Assignment).count()
    new_id = f"ASSIGN-{count + 1:03d}"

    new_assignment = Assignment(
        id=new_id,
        asset_id=payload.asset_id,
        user_id=payload.user_id,
        due_date=payload.due_date,
        status="active"
    )
    db.add(new_assignment)
    asset.status = "assigned"
    db.commit()
    db.refresh(new_assignment)
    return new_assignment

@router.get("", response_model=List[AssignmentResponse])
async def get_assignments(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_role = current_user.get("role")
    user_id = current_user.get("id")
    
    if user_role == "admin":
        assignments = db.query(Assignment).options().all()
    else:
        assignments = db.query(Assignment).filter(Assignment.user_id == user_id).all()
    
    return assignments

@router.get("/{assignment_id}", response_model=AssignmentResponse)
async def get_assignment(
    assignment_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    return assignment

@router.put("/{assignment_id}", response_model=AssignmentResponse)
async def update_assignment(
    assignment_id: str,
    payload: AssignmentUpdate,  # due_date, status etc.
    current_user: dict = Depends(require_assign),
    db: Session = Depends(get_db)
):
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    for key, value in payload.dict(exclude_unset=True).items():
        setattr(assignment, key, value)
    
    # Update asset status
    asset = db.query(Asset).filter(Asset.id == assignment.asset_id).first()
    if asset:
        asset.status = assignment.status if assignment.status != "active" else "assigned"
    
    db.commit()
    db.refresh(assignment)
    return assignment

@router.delete("/{assignment_id}")
async def delete_assignment(
    assignment_id: str,
    current_user: dict = Depends(require_assign),
    db: Session = Depends(get_db)
):
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    db.delete(assignment)
    asset = db.query(Asset).filter(Asset.id == assignment.asset_id).first()
    if asset:
        asset.status = "available"
    
    db.commit()
    return {"message": "Assignment deleted"}

