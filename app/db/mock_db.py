from typing import Dict, List, Optional
from datetime import datetime
from passlib.context import CryptContext

# Pre-computed hashes to avoid runtime hashing during import
ADMIN_PASSWORD_HASH = "$2b$12$W2bF6.5m0Q1pL8vN3rT5uY7wX9zA1bC3dE5fG7hI9jK1lM3nO5pQ7r"
EMPLOYEE_PASSWORD_HASH = "$2b$12$U3cG7.2nP4qM9wX2yZ5aB7cD0eF2gH4iJ6kL8mN0oP2qR4sT6uV8wX"

class Permission:
    VIEW_DASHBOARD = "view:dashboard"
    VIEW_ALL_ASSETS = "view:all_assets"
    VIEW_MY_GEAR = "view:my_gear"
    MANAGE_USERS = "manage:users"
    DELETE_ASSET = "delete:asset"
    CREATE_ASSET = "create:asset"
    ASSIGN_ASSET = "assign:asset"
    REVOKE_ASSET = "revoke:asset"
    REQUEST_ASSET = "request:asset"

class Role:
    ADMIN = "admin"
    EMPLOYEE = "employee"

ROLE_PERMISSIONS = {
    Role.ADMIN: [
        Permission.VIEW_DASHBOARD,
        Permission.VIEW_ALL_ASSETS,
        Permission.VIEW_MY_GEAR,
        Permission.MANAGE_USERS,
        Permission.DELETE_ASSET,
        Permission.CREATE_ASSET,
        Permission.ASSIGN_ASSET,
        Permission.REVOKE_ASSET,
    ],
    Role.EMPLOYEE: [
        Permission.VIEW_DASHBOARD,
        Permission.VIEW_MY_GEAR,
        Permission.REQUEST_ASSET,
    ],
}

# Instantiate pwd_context AFTER Permission/Role to avoid self-test during module import
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

USERS_DB = {
    "admin@company.com": {
        "id": 1,
        "email": "admin@company.com",
        "name": "Admin User",
        "role": Role.ADMIN,
        "initials": "AD",
        "password": ADMIN_PASSWORD_HASH,
    },
    "john@company.com": {
        "id": 2,
        "email": "john@company.com",
        "name": "John Employee",
        "role": Role.EMPLOYEE,
        "initials": "JE",
        "password": EMPLOYEE_PASSWORD_HASH,
    },
    "amit@company.com": {
        "id": 3,
        "email": "amit@company.com",
        "name": "Aiswarya Gangadharan",
        "role": Role.EMPLOYEE,
        "initials": "AG",
        "password": EMPLOYEE_PASSWORD_HASH,
    },
    "sneha@company.com": {
        "id": 4,
        "email": "sneha@company.com",
        "name": "Shalini",
        "role": Role.ADMIN,
        "initials": "S",
        "password": ADMIN_PASSWORD_HASH,
    },
}

# Rest unchanged
ASSETS_DB = [
    {
        "id": "DL-1001",
        "name": "Dell XPS 15",
        "type": "laptop",
        "assigned_to": 3,
        "assignee_name": "Aiswarya Gangadharan",
        "assignee_initials": "AG",
        "status": "assigned",
        "date": "2024-02-01",
        "notes": "High performance development laptop",
    },
    {
        "id": "IP-2001",
        "name": "iPhone 15 Pro",
        "type": "phone",
        "assigned_to": None,
        "assignee_name": None,
        "assignee_initials": None,
        "status": "available",
        "date": "2024-03-01",
        "notes": "Company phone available for request",
    },
    {
        "id": "AST-001",
        "name": "MacBook Pro M3",
        "type": "laptop",
        "assigned_to": 2,
        "assignee_name": "John Employee",
        "assignee_initials": "JE",
        "status": "assigned",
        "date": "2024-01-15",
        "notes": "Primary development machine",
    },
    {
        "id": "MON-3001",
        "name": "Dell UltraSharp 27",
        "type": "monitor",
        "assigned_to": None,
        "assignee_name": None,
        "assignee_initials": None,
        "status": "available",
        "date": "2024-03-10",
        "notes": "4K Resolution monitor",
    },
    {
        "id": "KEY-4001",
        "name": "Logitech MX Keys",
        "type": "peripherals",
        "assigned_to": 3,
        "assignee_name": "Aiswarya Gangadharan",
        "assignee_initials": "AG",
        "status": "maintenance",
        "date": "2024-03-20",
        "notes": "Battery issues reported",
    },
    {
        "id": "TAB-5001",
        "name": "iPad Pro 12.9",
        "type": "tablet",
        "assigned_to": None,
        "assignee_name": None,
        "assignee_initials": None,
        "status": "available",
        "date": "2024-03-25",
        "notes": "Design and testing tablet",
    },
    {
        "id": "HEA-6001",
        "name": "Sony WH-1000XM5",
        "type": "audio",
        "assigned_to": 2,
        "assignee_name": "John Employee",
        "assignee_initials": "JE",
        "status": "assigned",
        "date": "2024-02-15",
        "notes": "Noise-cancelling headphones",
    },
    {
        "id": "DL-1002",
        "name": "ThinkPad X1 Carbon",
        "type": "laptop",
        "assigned_to": None,
        "assignee_name": None,
        "assignee_initials": None,
        "status": "maintenance",
        "date": "2024-03-18",
        "notes": "Screen flickering issue",
    }
]

REQUESTS_DB = [
    {
        "id": "REQ-001",
        "user_id": 3,
        "user_name": "Aiswarya Gangadharan",
        "user_email": "amit@company.com",
        "asset_type": "Monitor",
        "reason": "Need a second screen for coding",
        "status": "pending",
        "timestamp": "2026-04-07T10:00:00Z",
    }
]

ACTIVITY_LOGS = [
    {
        "id": "LOG-001",
        "asset_id": "DL-1001",
        "action": "Assigned",
        "user_id": 3,
        "user_name": "Aiswarya Gangadharan",
        "timestamp": "2026-02-01T09:00:00Z",
        "notes": "Initial assignment"
    }
]

def add_log(asset_id, action, user_id, user_name, notes=""):
    log_id = f"LOG-{len(ACTIVITY_LOGS) + 1:03d}"
    ACTIVITY_LOGS.append({
        "id": log_id,
        "asset_id": asset_id,
        "action": action,
        "user_id": user_id,
        "user_name": user_name,
        "timestamp": datetime.now().isoformat(),
        "notes": notes
    })

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password[:72])

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)
