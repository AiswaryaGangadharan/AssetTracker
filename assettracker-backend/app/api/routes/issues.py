from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.api.deps import get_current_user, require_permission
# Removed mock_db
from app.models.domain import Issue, User, Asset  # Assume Issue model added
from app.schemas.issue import IssueCreate, IssueResponse

router = APIRouter()

@router.get("")
async def get_issues(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_role = current_user.get("role")
    user_id = current_user.get("id")
    
    if user_role == "admin":
        issues = db.query(Issue).all()
    else:
        issues = db.query(Issue).filter(Issue.user_id == user_id).all()
    
    return {"issues": issues}

@router.post("")
async def create_issue(
    payload: IssueCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check asset exists
    asset = db.query(Asset).filter(Asset.id == payload.asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    new_id = f"ISSUE-{db.query(Issue).count() + 1:03d}"
    new_issue = Issue(
        id=new_id,
        asset_id=payload.asset_id,
        user_id=current_user["id"],
        description=payload.description,
        severity=payload.severity,
        status="open"
    )
    db.add(new_issue)
    db.commit()
    db.refresh(new_issue)
    return {"issue": new_issue, "message": "Issue reported"}

@router.post("/{issue_id}/resolve")
async def resolve_issue(
    issue_id: str,
    current_user: dict = Depends(require_permission("resolve:issue")),  # admin:resolve:issue in ROLE_PERMISSIONS
    db: Session = Depends(get_db)
):
    issue = db.query(Issue).filter(Issue.id == issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    
    issue.status = "resolved"
    db.commit()
    return {"issue": issue, "message": "Issue resolved"}

