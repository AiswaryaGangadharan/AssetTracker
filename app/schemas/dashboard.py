from pydantic import BaseModel

class DashboardStats(BaseModel):
    total_assets: int
    employees: int
    active_assets: int
    department_assets: int
