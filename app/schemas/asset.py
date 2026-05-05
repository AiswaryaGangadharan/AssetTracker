from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AssetCreate(BaseModel):
    name: str
    type: str
    notes: Optional[str] = None

class AssetResponse(BaseModel):
    id: str
    name: str
    type: str
    assignee_id: Optional[int]
    assignee_name: Optional[str]
    assignee_initials: Optional[str]
    status: str
    last_assigned_date: Optional[datetime]
    notes: Optional[str]

