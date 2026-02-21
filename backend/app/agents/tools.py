
from app.db.client import supabase
from datetime import datetime

# Tool definitions for ADK Agents
# In a full ADK setup, we'd decorate these. 
# For this implementation using standard Gemini SDK, we will pass these as function declarations 
# or just call them from the service before prompting the model (simpler and cheaper).

# However, for "Calorie Retriever Agent", we want the Agent to DECIDE whether to search DB or Web.
# So we defining them as potential tools.

async def get_db_food_item(name: str):
    """Searches the local Supabase DB for a food item."""
    # Simple fuzzy search
    response = supabase.table("food_items").select("*").ilike("name", f"%{name}%").limit(1).execute()
    if response.data:
        return response.data[0]
    return None

async def save_food_item_to_db(meal_id: str, name: str, calories: int, protein: float, carbs: float, fats: float):
    """Saves a new food item to the database."""
    data = {
        "meal_id": meal_id,
        "name": name,
        "calories": calories,
        "protein": protein,
        "carbs": carbs,
        "fats": fats,
        "quantity": 1
    }
    response = supabase.table("food_items").insert(data).execute()
    return response.data[0] if response.data else None

async def get_day_activity(user_id: str, date: str):
    """Fetches workouts for a specific user and date."""
    start = f"{date}T00:00:00"
    end = f"{date}T23:59:59"
    response = supabase.table("workouts").select("*, exercises(*, sets(*))").eq("user_id", user_id).gte("date", start).lte("date", end).execute()
    return response.data

async def get_day_diet(user_id: str, date: str):
    """Fetches meals for a specific user and date."""
    response = supabase.table("meals").select("*, items:food_items(*)").eq("user_id", user_id).eq("date", date).execute()
    return response.data
