from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List
import jwt
from datetime import datetime, timedelta
from fastapi.middleware.cors import CORSMiddleware
import jwt

SECRET_KEY = "super-secret-key-change-in-prod"


app = FastAPI()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

# RBAC Configuration
ROLES = {
    "admin": [
        "view:dashboard",
        "view:all_assets", 
        "view:my_gear",
        "manage:users",
        "delete:asset",
        "create:asset"
    ],
    "employee": [
        "view:dashboard",
        "view:my_gear"
    ]
}

class User(BaseModel):
    id: int
    username: str
    role: str
    permissions: List[str]

class RequirePrivilege:
    def __init__(self, required_permission: str):
        self.required_permission = required_permission
    
    def __call__(self, credentials: HTTPAuthorizationCredentials = Depends(security)):
        try:
            token = credentials.credentials
            payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])

            user_role = payload.get("role")
            permissions = ROLES.get(user_role, [])
            
            if self.required_permission not in permissions:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Access denied. Permission '{self.required_permission}' required. Your role: {user_role}"
                )
            
            return User(
                id=payload.get("id"),
                username=payload.get("username"),
                role=user_role,
                permissions=permissions
            )
            
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token expired")
        except jwt.InvalidTokenError:
            raise HTTPException(status_code=401, detail="Invalid token")

@app.post("/login")
def login(request: dict):
    username = request.get('username')
    password = request.get('password')
    if username == "admin" and password == "admin":
        role = "admin"
        user_id = 1
    elif username == "employee" and password == "employee":
        role = "employee"
        user_id = 2
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = jwt.encode(
        {
            "id": user_id,
            "username": username,
            "role": role,
            "exp": datetime.utcnow() + timedelta(hours=24)
        },
        SECRET_KEY,
        algorithm="HS256"
    )
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": role,
        "permissions": ROLES[role]
    }

@app.get("/assets")
def get_all_assets(current_user: User = Depends(RequirePrivilege("view:all_assets"))):
    return {
        "assets": [
            {"id": 1, "name": "MacBook Pro M3", "type": "Laptop", "assignee": "John Doe", "status": "excellent"},
            {"id": 2, "name": "Dell Monitor U2723QE", "type": "Monitor", "assignee": "Alice Smith", "status": "good"},
            {"id": 3, "name": "Logitech MX Keys", "type": "Keyboard", "assignee": "Robert Johnson", "status": "active"}
        ],
        "access_granted_to": current_user.username
    }

@app.get("/my-gear")
def get_my_gear(current_user: User = Depends(RequirePrivilege("view:my_gear"))):
    return {
        "assets": [
            {"id": "A-1001", "name": "ThinkPad T14 Gen 3", "type": "Laptop", "status": "excellent", "assigned": "Mar 1, 2026"},
            {"id": "A-1002", "name": "Dell UltraSharp 27", "type": "Monitor", "status": "good", "assigned": "Feb 20, 2026"}
        ],
        "user": current_user.username
    }

@app.delete("/assets/{asset_id}")
def delete_asset(asset_id: int, current_user: User = Depends(RequirePrivilege("delete:asset"))):
    return {"message": f"Asset {asset_id} deleted successfully", "deleted_by": current_user.username}

@app.post("/assets")
def create_asset(asset: dict, current_user: User = Depends(RequirePrivilege("create:asset"))):
    return {"message": "Asset created successfully", "asset": asset, "created_by": current_user.username}

@app.get("/users")
def get_users(current_user: User = Depends(RequirePrivilege("manage:users"))):
    return {
        "users": [
            {"id": 1, "name": "Admin User", "email": "admin@company.com", "role": "admin"},
            {"id": 2, "name": "John Employee", "email": "john@company.com", "role": "employee"}
        ],
        "access_granted_to": current_user.username
    }

@app.get("/dashboard")
def get_dashboard(current_user: User = Depends(RequirePrivilege("view:dashboard"))):
    stats = {
        "active_assets": 98,
        "total_assets": 120 if current_user.role == "admin" else None,
        "employees": 25 if current_user.role == "admin" else None
    }
    stats = {k: v for k, v in stats.items() if v is not None}
    
    return {
        "stats": stats,
        "user_role": current_user.role,
        "username": current_user.username
    }

@app.get("/verify")
def verify_token(current_user: User = Depends(RequirePrivilege("view:dashboard"))):
    return {
        "valid": True,
        "user": current_user.username,
        "role": current_user.role,
        "permissions": current_user.permissions
    }

@app.get("/")
def root():
    return {"message": "AssetTracker API", "status": "running", "rbac": "enabled"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)