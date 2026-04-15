from fastapi import APIRouter
from app.api.routes import auth, assets, dashboard, users, requests, activity, issues, assignments

api_router = APIRouter()


api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(assets.router, prefix="/assets", tags=["assets"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(requests.router, prefix="/requests", tags=["requests"])
api_router.include_router(activity.router, prefix="/activity", tags=["activity"])
api_router.include_router(issues.router, prefix="/issues", tags=["issues"])
api_router.include_router(assignments.router, prefix="/assignments", tags=["assignments"])


