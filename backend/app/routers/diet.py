from fastapi import APIRouter, Depends
from app.schemas.diet import Meal, MealCreate, FoodItem
from app.services.diet_service import DietService
from typing import List, Any
from app.auth import get_current_user

router = APIRouter(
    prefix="/meals",
    tags=["meals"]
)

@router.get("/", response_model=List[Meal])
async def get_meals(date: str, user: Any = Depends(get_current_user)):
    # Date format YYYY-MM-DD
    return await DietService.get_meals_by_date(user.id, date)

@router.post("/", response_model=Meal)
async def log_meal(meal: MealCreate, user: Any = Depends(get_current_user)):
    return await DietService.create_meal(user.id, meal)

@router.get("/recent-foods", response_model=List[FoodItem])
async def get_recent_foods(user: Any = Depends(get_current_user)):
    return await DietService.get_recent_foods(user.id)
