from fastapi import APIRouter, HTTPException, Depends, Query
from app.schemas.workout import Workout, WorkoutCreate, ExercisePerformance
from app.services.workout_service import WorkoutService
from typing import List

from app.auth import get_current_user
from typing import List, Any

router = APIRouter(
    prefix="/workouts",
    tags=["workouts"]
)

@router.get("/", response_model=List[Workout])
async def get_workouts(user: Any = Depends(get_current_user)):
    return await WorkoutService.get_all_workouts(user.id)

@router.post("/", response_model=Workout)
async def create_workout(workout: WorkoutCreate, user: Any = Depends(get_current_user)):
    return await WorkoutService.create_workout(user.id, workout)

@router.get("/last-performance", response_model=List[ExercisePerformance])
async def get_last_performance(exercise_names: List[str] = Query(None), user: Any = Depends(get_current_user)):
    return await WorkoutService.get_last_performance(user.id, exercise_names or [])

@router.get("/{workout_id}", response_model=Workout)
async def get_workout(workout_id: str):
    workout = await WorkoutService.get_workout_by_id(workout_id)
    if not workout:
        raise HTTPException(status_code=404, detail="Workout not found")
    return workout
