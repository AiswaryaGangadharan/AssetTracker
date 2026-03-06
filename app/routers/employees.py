from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def get_employees():
    return {"message": "Employees endpoint working!"}

@router.get("/{employee_id}")
def get_employee(employee_id: int):
    return {"employee_id": employee_id, "name": f"Employee {employee_id}"}