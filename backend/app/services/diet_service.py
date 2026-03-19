from typing import List
from app.db.client import get_supabase

class DietService:
    @staticmethod
    async def get_meals_by_date(user_id: str, date: str) -> List[dict]:
        supabase = get_supabase()
        response = (supabase.table("meals")
                   .select("*, food_items(*)")
                   .eq("user_id", user_id)
                   .eq("date", date)
                   .execute())
        
        meals = response.data
        for m in meals:
            m["items"] = m.pop("food_items", [])
        return meals

    @staticmethod
    async def create_meal(user_id: str, meal) -> dict:
        supabase = get_supabase()
        
        # Calculate totals from items if provided, otherwise use provided totals
        if meal.items:
            total_cal = sum(item.calories for item in meal.items)
            total_protein = sum(item.protein for item in meal.items)
            total_carbs = sum(item.carbs for item in meal.items)
            total_fats = sum(item.fats for item in meal.items)
        else:
            total_cal = meal.calories or 0
            total_protein = meal.protein or 0
            total_carbs = meal.carbs or 0
            total_fats = meal.fats or 0
        
        meal_res = supabase.table("meals").insert({
            "user_id": user_id,
            "name": meal.name,
            "date": meal.date.isoformat(),
            "type": meal.type,
            "total_calories": total_cal,
            "total_protein": total_protein,
            "total_carbs": total_carbs,
            "total_fats": total_fats
        }).execute()
        
        created_meal = meal_res.data[0]
        
        if meal.items:
            items_to_insert = [
                {
                    "meal_id": created_meal["id"],
                    "name": item.name,
                    "calories": item.calories,
                    "protein": item.protein,
                    "carbs": item.carbs,
                    "fats": item.fats,
                    "quantity": item.quantity
                }
                for item in meal.items
            ]
            items_res = supabase.table("food_items").insert(items_to_insert).execute()
            created_meal["items"] = items_res.data
        else:
            created_meal["items"] = []
            
        return created_meal

    @staticmethod
    async def get_recent_foods(user_id: str) -> List[dict]:
        supabase = get_supabase()
        response = (supabase.table("food_items")
                   .select("*, meals!inner(user_id)")
                   .eq("meals.user_id", user_id)
                   .order("created_at", desc=True)
                   .limit(20)
                   .execute())
        
        # Deduplicate by name
        seen = set()
        unique = []
        for item in response.data:
            if item["name"] not in seen:
                seen.add(item["name"])
                unique.append(item)
                if len(unique) >= 10:
                    break
        return unique
