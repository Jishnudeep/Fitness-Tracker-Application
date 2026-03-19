
from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime
from uuid import UUID

class GoalBase(BaseModel):
    current_height: Optional[float] = Field(None, description="Height in cm")
    current_weight: Optional[float] = Field(None, description="Weight in kg")
    current_body_fat: Optional[float] = Field(None, description="Body fat percentage")
    age: Optional[int] = Field(None, description="Age in years")
    lifestyle: Optional[str] = Field(None, description="Sedentary, Active, etc.")
    gender: Optional[str] = Field(None, description="Male or Female")
    goal_weight: Optional[float] = None
    goal_body_fat: Optional[float] = None
    target_date: Optional[datetime] = None
    daily_caloric_deficit: Optional[int] = None
    daily_calories: Optional[int] = None

class GoalCreate(GoalBase):
    pass

class GoalUpdate(GoalBase):
    pass

class Goal(GoalBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
