from pydantic import BaseModel, Field
from typing import List, Optional
from uuid import UUID
from datetime import datetime

class TemplateExerciseBase(BaseModel):
    exercise_id: UUID
    default_sets: int = 3
    default_reps: Optional[int] = 10
    default_weight: Optional[float] = 0.0
    default_speed: Optional[float] = None
    default_incline: Optional[float] = None
    default_time_seconds: Optional[int] = None
    default_calories_burnt: Optional[float] = 60.0
    default_steps: Optional[int] = 0
    order_index: int

class TemplateExerciseCreate(TemplateExerciseBase):
    pass

class TemplateExercise(TemplateExerciseBase):
    id: UUID
    name: Optional[str] = None
    muscle_group: Optional[str] = None

    class Config:
        from_attributes = True

class TemplateBase(BaseModel):
    name: str
    description: Optional[str] = None

class TemplateCreate(TemplateBase):
    exercises: List[TemplateExerciseCreate]

class TemplateUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    exercises: Optional[List[TemplateExerciseCreate]] = None

class Template(TemplateBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    exercises: List[TemplateExercise] = []

    class Config:
        from_attributes = True
