from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def get_assignments():
    return {"message": "Assignments endpoint working!"}

@router.get("/{assignment_id}")
def get_assignment(assignment_id: int):
    return {"assignment_id": assignment_id, "details": f"Assignment {assignment_id}"}