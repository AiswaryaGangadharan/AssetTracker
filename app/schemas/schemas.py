from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# ======= Employee Schemas =======
class EmployeeCreate(BaseModel):
    name: str
    employee_id: str
    department: str

class EmployeeUpdate(BaseModel):
    name: str
    employee_id: str
    department: str

class EmployeeOut(BaseModel):
    id: int
    name: str
    employee_id: str
    department: str

# ======= Asset Schemas =======
class AssetCreate(BaseModel):
    asset_name: str
    type: str
    status: str

class AssetUpdate(BaseModel):
    asset_name: str
    type: str
    status: str

class AssetStatusUpdate(BaseModel):
    status: str

class AssetOut(BaseModel):
    id: int
    asset_name: str
    type: str
    status: str

# ======= Assignment Schemas =======
class AssignmentCreate(BaseModel):
    employee_id: int
    asset_id: int

class AssignmentReturn(BaseModel):
    return_date: datetime

class AssignmentOut(BaseModel):
    id: int
    employee_id: int
    asset_id: int
    assigned_date: datetime
    return_date: Optional[datetime]

# ======= Dashboard Schemas =======
class DashboardCount(BaseModel):
    count: int