from typing import Dict, List, Optional
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class Permission:
    VIEW_DASHBOARD = "view:dashboard"
    VIEW_ALL_ASSETS = "view:all_assets"
    VIEW_MY_GEAR = "view:my_gear"
    MANAGE_USERS = "manage:users"
    DELETE_ASSET = "delete:asset"
    CREATE_ASSET = "create:asset"

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
    ],
    Role.EMPLOYEE: [
        Permission.VIEW_DASHBOARD,
        Permission.VIEW_MY_GEAR,
    ],
}

USERS_DB = {
    "admin@company.com": {
        "id": 1,
        "email": "admin@company.com",
        "name": "Admin User",
        "role": Role.ADMIN,
        "initials": "AD",
        "password": pwd_context.hash("admin123"),
    },
    "john@company.com": {
        "id": 2,
        "email": "john@company.com",
        "name": "John Employee",
        "role": Role.EMPLOYEE,
        "initials": "JE",
        "password": pwd_context.hash("employee123"),
    },
    "amit@company.com": {
        "id": 3,
        "email": "amit@company.com",
        "name": "Aiswarya Gangadharan",
        "role": Role.EMPLOYEE,
        "initials": "AG",
        "password": pwd_context.hash("employee123"),
    },
    "sneha@company.com": {
        "id": 4,
        "email": "sneha@company.com",
        "name": "Shalini",
        "role": Role.ADMIN,
        "initials": "S",
        "password": pwd_context.hash("admin123"),
    },
}

ASSETS_DB = [
    {
        "id": "DL-1001",
        "name": "Dell Laptop",
        "type": "Hardware",
        "assigned_to": 3,
        "assignee_name": "Aiswarya Gangadharan",
        "assignee_initials": "AG",
        "status": "active",
        "date": "2026-02-01",
        "notes": "Assigned to IT employee",
    },
    {
        "id": "IP-2001",
        "name": "iPhone",
        "type": "Hardware",
        "assigned_to": None,
        "assignee_name": None,
        "assignee_initials": None,
        "status": "available",
        "date": "2026-03-01",
        "notes": "Company phone available",
    },
    {
        "id": "AST-001",
        "name": "MacBook Pro M3",
        "type": "laptop",
        "assigned_to": 2,
        "assignee_name": "John Employee",
        "assignee_initials": "JE",
        "status": "active",
        "date": "2024-01-15",
        "notes": "Primary development machine",
    },
]
