from fastapi import FastAPI
from routers import auth
from routers.employees import router as employees
from routers.assets import router as assets
from routers.assignments import router as assignments
from routers.dashboard import router as dashboard
from routers.search import router as search
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
