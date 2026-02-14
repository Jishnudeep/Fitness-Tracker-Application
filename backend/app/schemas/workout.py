from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from uuid import UUID
from enum import Enum

class MuscleGroup(str, Enum):
    CHEST = 'Chest'
    BACK = 'Back'
    LEGS = 'Legs'
    SHOULDERS = 'Shoulders'
    ARMS = 'Arms'
    ABS = 'Abs'
    CARDIO = 'Cardio'
    OTHER = 'Other'

# --- Set Schemas ---
class SetBase(BaseModel):
    reps: Optional[int] = None
    weight: Optional[float] = None
    speed: Optional[float] = None
    incline: Optional[float] = None
    time_seconds: Optional[int] = None
    calories_burnt: Optional[float] = 0.0
    steps: Optional[int] = 0
    completed: bool = False

class SetCreate(SetBase):
    pass

class Set(SetBase):
    id: UUID
    workout_exercise_id: UUID

    class Config:
        from_attributes = True

# --- Exercise Schemas (Master List) ---
class ExerciseBase(BaseModel):
    name: str
    muscle_group: MuscleGroup = Field(..., alias="muscleGroup")

class ExerciseCreate(ExerciseBase):
    pass

class Exercise(ExerciseBase):
    id: UUID
    
    class Config:
        from_attributes = True

# --- Workout Exercise (Join + Sets) ---
class WorkoutExerciseCreate(BaseModel):
    # Frontend sends full exercise details. We match that structure.
    # id: Optional[str] = None # We ignore the frontend ID for creation logic usually, relies on name.
    name: str
    muscle_group: MuscleGroup = Field(..., alias="muscleGroup")
    sets: List[SetCreate]

class WorkoutExercise(BaseModel):
    id: UUID
    exercise: Exercise # Nested exercise details
    sets: List[Set]
    
    class Config:
        from_attributes = True

# --- Workout Schemas ---
class WorkoutBase(BaseModel):
    name: str
    date: datetime
    duration_minutes: int = Field(..., alias="durationMinutes")
    notes: Optional[str] = None

class WorkoutCreate(WorkoutBase):
    # For creating a workout, we accept a list of detailed exercises (frontend style)
    exercises: List[WorkoutExerciseCreate] 
    template_id: Optional[UUID] = None
    save_as_template: bool = False # If true, create a new template from this workout

class Workout(WorkoutBase):
    id: UUID
    user_id: UUID
    exercises: List['FrontendExercise'] 
    
    class Config:
        from_attributes = True

# --- Frontend specific mapping ---
# The frontend nests Sets INSIDE Exercise, but DB has Workout -> WorkoutExercise -> Exercise
class FrontendExercise(BaseModel):
    id: UUID # Exercise ID (or WorkoutExercise ID? Frontend types.ts says Exercise.id. This is ambiguous in a workout context vs master list)
    # Usually in a workout view, ID is the WorkoutExercise ID to update sets, OR it's the Exercise ID.
    # Looking at types.ts: "exercises: Exercise[]". Exercise has "id: string" and "sets: Set[]".
    # Typically this ID is the Unique Identifier for that instance in the workout if we want to edit specific instances.
    # However, for now, let's map it to the underlying Exercise ID and we manage WorkoutExercise ID internally or expose it separately.
    # WAIT: If I have 2 instances of 'Bench Press' in a workout, mapping by Exercise ID matches both.
    # We should probably attach the `workout_exercise_id` somewhere.
    
    name: str
    muscle_group: MuscleGroup = Field(..., alias="muscleGroup")
    sets: List[Set]
    workout_exercise_id: Optional[UUID] = None # Helpful for backend reference

class ExercisePerformance(BaseModel):
    exerciseName: str
    lastWeight: float
    lastReps: int
    lastDate: Optional[datetime] = None
