from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import date
from uuid import UUID

class FoodItemBase(BaseModel):
    name: str
    calories: int
    protein: float
    carbs: float
    fats: float
    quantity: float = 1.0

class FoodItemCreate(FoodItemBase):
    pass

class FoodItem(FoodItemBase):
    id: UUID
    meal_id: UUID
    
    class Config:
        from_attributes = True

class MealBase(BaseModel):
    name: Optional[str] = None
    date: date
    type: Literal['Breakfast', 'Lunch', 'Dinner', 'Snack']
    
class MealCreate(MealBase):
    # When creating, we might calculate totals from items or trust the frontend?
    # Better to calculate on backend.
    items: List[FoodItemCreate] = []

class Meal(MealBase):
    id: UUID
    user_id: UUID
    items: List[FoodItem] = []
    
    # Computed/Cached totals
    total_calories: int = Field(..., alias="calories") 
    total_protein: float = Field(..., alias="protein")
    total_carbs: float = Field(..., alias="carbs")
    total_fats: float = Field(..., alias="fats")

    class Config:
        from_attributes = True
