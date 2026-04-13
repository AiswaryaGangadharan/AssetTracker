from fastapi import FastAPI
from routers import auth
from app.routers.employees import router as employees
from app.routers.assets import router as assets
from app.routers.assignments import router as assignments
from app.routers.dashboard import router as dashboard
from app.routers.search import router as search
app = FastAPI(title="Asset Tracker API")

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(employees.router, prefix="/employees", tags=["Employees"])
app.include_router(assets.router, prefix="/assets", tags=["Assets"])
app.include_router(assignments.router, prefix="/assignments", tags=["Assignments"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
app.include_router(search.router, prefix="/search", tags=["Search"])

@app.get("/")
def root():
    return {"message": "API is working!"}
