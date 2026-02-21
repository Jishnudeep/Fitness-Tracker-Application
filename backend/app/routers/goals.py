
from fastapi import APIRouter, Depends, HTTPException
from app.schemas.goal import Goal, GoalCreate
from app.services.goal_service import GoalService
from app.auth import get_current_user
from typing import Any
from app.agents.goal_agent import analyze_goal # Logic to be implemented

router = APIRouter(
    prefix="/goals",
    tags=["goals"]
)

@router.get("/", response_model=Goal)
async def get_goal(user: Any = Depends(get_current_user)):
    goal = await GoalService.get_goal(user.id)
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    return goal

@router.post("/", response_model=Goal)
async def create_or_update_goal(goal: GoalCreate, user: Any = Depends(get_current_user)):
    return await GoalService.create_goal(user.id, goal)

@router.post("/analyze")
async def analyze_goal_endpoint(goal_input: GoalCreate, user: Any = Depends(get_current_user)):
    """
    Calls the ADK Agent to analyze the goal and suggest a deficit.
    Returns the Agent's response (Markdown + Structured Deficit).
    """
    analysis = await analyze_goal(goal_input)
    return analysis
