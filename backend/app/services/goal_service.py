
from app.db.client import supabase
from app.schemas.goal import GoalCreate, GoalUpdate
from typing import Optional, Dict, Any

class GoalService:
    @staticmethod
    async def get_goal(user_id: str) -> Optional[Dict[str, Any]]:
        response = supabase.table("goals").select("*").eq("user_id", user_id).limit(1).execute()
        if response.data:
            return response.data[0]
        return None

    @staticmethod
    async def create_goal(user_id: str, goal: GoalCreate) -> Dict[str, Any]:
        existing = await GoalService.get_goal(user_id)
        if existing:
            return await GoalService.update_goal(user_id, goal)
        
        data = goal.model_dump(mode='json')
        data["user_id"] = user_id
        
        response = supabase.table("goals").insert(data).execute()
        return response.data[0] if response.data else None

    @staticmethod
    async def update_goal(user_id: str, goal: GoalCreate) -> Dict[str, Any]:
        data = goal.model_dump(exclude_unset=True, mode='json')
        response = supabase.table("goals").update(data).eq("user_id", user_id).execute()
        return response.data[0] if response.data else None

    @staticmethod
    async def save_ai_plan(user_id: str, deficit: int, plan_summary: str):
        # Example of updating just the AI parts
        data = {"daily_caloric_deficit": deficit}
        # We might want to store the plan summary (text) somewhere too, maybe in 'notes' column if we add it?
        # For now, just deficit.
        supabase.table("goals").update(data).eq("user_id", user_id).execute()
