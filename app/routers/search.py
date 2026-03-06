from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def search_items(query: str = ""):
    return {"query": query, "results": f"Results for '{query}'"}