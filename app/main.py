from fastapi import FastAPI
from routers import auth_router as auth
from routers import employees_router as employees
from routers import assets_router as assets
from routers import assignments_router as assignments
from routers import dashboard_router as dashboard
from routers import search_router as search
app = FastAPI(title="Asset Tracker API")

app.include_router(auth, prefix="/auth", tags=["Auth"])
app.include_router(employees, prefix="/employees", tags=["Employees"])
app.include_router(assets, prefix="/assets", tags=["Assets"])
app.include_router(assignments, prefix="/assignments", tags=["Assignments"])
app.include_router(dashboard, prefix="/dashboard", tags=["Dashboard"])
app.include_router(search, prefix="/search", tags=["Search"])

@app.get("/")
def root():
    return {"message": "API is working!"}
