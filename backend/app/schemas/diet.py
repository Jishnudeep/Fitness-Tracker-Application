from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Literal
from datetime import date, datetime
from uuid import UUID

class FoodItemBase(BaseModel):
    model_config = ConfigDict(populate_by_name=True, from_attributes=True)
    
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

class MealBase(BaseModel):
    model_config = ConfigDict(populate_by_name=True, from_attributes=True)
    
    name: Optional[str] = None
    date: datetime
    type: Literal['Breakfast', 'Lunch', 'Dinner', 'Snack']
    # Aggregated macros (can be sent from frontend or calculated)
    calories: Optional[int] = Field(None, validation_alias="total_calories")
    protein: Optional[float] = Field(None, validation_alias="total_protein")
    carbs: Optional[float] = Field(None, validation_alias="total_carbs")
    fats: Optional[float] = Field(None, validation_alias="total_fats")
    
class MealCreate(MealBase):
    items: List[FoodItemCreate] = []

class Meal(MealBase):
    id: UUID
    user_id: UUID
    items: List[FoodItem] = []
    
    # Computed/Cached totals (using validation_alias to map DB names)
    calories: int = Field(..., validation_alias="total_calories") 
    protein: float = Field(..., validation_alias="total_protein")
    carbs: float = Field(..., validation_alias="total_carbs")
    fats: float = Field(..., validation_alias="total_fats")
