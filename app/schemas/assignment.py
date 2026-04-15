from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

class AssignmentBase(BaseModel):
    asset_id: str
    user_id: int
    due_date: Optional[date] = None

class AssignmentCreate(AssignmentBase):
    pass

class AssignmentUpdate(BaseModel):
    due_date: Optional[date] = None
    status: Optional[str] = None
    return_date: Optional[date] = None

class AssignmentResponse(AssignmentBase):
    id: str
    assigned_date: datetime
    status: str
    return_date: Optional[date]

    class Config:
        from_attributes = True

class Assignment(AssignmentBase):
    id: str
    assigned_date: datetime
    status: str = "active"
    return_date: Optional[date] = None

    class Config:
        from_attributes = True

