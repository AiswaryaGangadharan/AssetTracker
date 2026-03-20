from fastapi import HTTPException, Depends, status

# 1. This is the Gatekeeper function
def require_admin_role(current_user: dict):
    # This assumes your user object has a 'role' field
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to do this!"
        )
    return True

# 2. This is how you use it on your DELETE route
@app.delete("/assets/{id}")
def delete_asset(id: int, admin_check=Depends(require_admin_role)):
    # The code below only runs if require_admin_role says "Yes"
    return {"message": "Asset deleted successfully"}