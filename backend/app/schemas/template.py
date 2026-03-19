from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from uuid import UUID
from datetime import datetime

class TemplateExerciseBase(BaseModel):
    exercise_id: UUID = Field(..., alias="exercise_id")
    default_sets: int = Field(3, alias="defaultSets")
    default_reps: Optional[int] = Field(10, alias="defaultReps")
    default_weight: Optional[float] = Field(0.0, alias="defaultWeight")
    default_speed: Optional[float] = Field(None, alias="defaultSpeed")
    default_incline: Optional[float] = Field(None, alias="defaultIncline")
    default_time_seconds: Optional[int] = Field(None, alias="defaultTimeSeconds")
    default_calories_burnt: Optional[float] = Field(60.0, alias="defaultCaloriesBurnt")
    default_steps: Optional[int] = Field(0, alias="defaultSteps")
    order_index: int = Field(..., alias="orderIndex")

class TemplateExerciseCreate(TemplateExerciseBase):
    pass

class TemplateExercise(TemplateExerciseBase):
    id: UUID
    name: Optional[str] = None
    muscle_group: Optional[str] = None

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

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

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
