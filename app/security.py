from fastapi import Depends, HTTPException, status

# Example role permissions
ROLE_PERMISSIONS = {
    "admin": [
        "view:employees",
        "delete:asset",
        "add:asset",
        "view:inventory"
    ],
    "employee": [
        "view:my_assets"
    ]
}


def RequirePrivilege(permission: str):

    def check_permission(current_user: dict = {"role": "employee"}):
        role = current_user.get("role")

        if permission not in ROLE_PERMISSIONS.get(role, []):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission"
            )

        return True

    return Depends(check_permission)