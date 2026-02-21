
from fastapi import APIRouter, Depends, Query, HTTPException
from app.auth import get_current_user
from typing import Any, Optional
from datetime import date
from app.agents.activity_agent import review_activity
from app.agents.diet_agent import review_diet, search_and_retrieve_food

router = APIRouter(
    prefix="/agents",
    tags=["agents"]
)

@router.post("/review/day")
async def review_day(date: str = Query(..., description="YYYY-MM-DD"), section: str = Query("all"), user: Any = Depends(get_current_user)):
    """
    Triggers the Agents to review the specific date.
    section: 'activity', 'diet', or 'all'
    """
    results = {}
    
    if section in ["all", "activity"]:
        activity_review = await review_activity(user.id, date)
        results["activity"] = activity_review
        
    if section in ["all", "diet"]:
        diet_review = await review_diet(user.id, date)
        results["diet"] = diet_review
        
    return results

@router.get("/food/search")
async def search_food(query: str, user: Any = Depends(get_current_user)):
    """
    Triggers the Calorie Retriever Agent (Lazy RAG).
    Returns food item details (from DB or AI retrieval).
    """
    if not query:
        raise HTTPException(status_code=400, detail="Query required")
        
    result = await search_and_retrieve_food(query)
    return result
