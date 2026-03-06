from fastapi import FastAPI
from app.routers import employees, assets, assignments, dashboard, search
app = FastAPI(title="Asset Tracker API")

app.include_router(employees.router, prefix="/employees", tags=["Employees"])
app.include_router(assets.router, prefix="/assets", tags=["Assets"])
app.include_router(assignments.router, prefix="/assignments", tags=["Assignments"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
app.include_router(search.router, prefix="/search", tags=["Search"])

@app.get("/")
def root():
    return {"message": "API is working!"}