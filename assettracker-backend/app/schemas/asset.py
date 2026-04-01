from pydantic import BaseModel
from typing import Optional

class AssetResponse(BaseModel):
    id: str
    name: str
    type: str
    assigned_to: Optional[int]
    assignee_name: Optional[str]
    assignee_initials: Optional[str]
    status: str
    date: str
    notes: Optional[str]
