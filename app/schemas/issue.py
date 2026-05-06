from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class IssueCreate(BaseModel):
    asset_id: str
    description: str
    severity: str = "medium"  # low, medium, high

class IssueResponse(BaseModel):
    id: str
    asset_id: str
    user_id: int
    description: str
    normalized_description: Optional[str] = None
    severity: str
    status: str = "open"
    timestamp: datetime
    asset_name: Optional[str] = "Unknown"
    user_name: Optional[str] = "Unknown"

    class Config:
        orm_mode = True
        from_attributes = True

