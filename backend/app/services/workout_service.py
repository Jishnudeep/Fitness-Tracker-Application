from typing import List, Optional
from uuid import UUID
from app.db.client import get_supabase
from app.schemas.workout import WorkoutCreate, Workout
from app.services.template_service import TemplateService
from app.schemas.template import TemplateCreate, TemplateExerciseCreate

class WorkoutService:
    @staticmethod
    async def get_all_workouts(user_id: str) -> List[dict]:
        supabase = get_supabase()
        response = (supabase.table("workouts")
                   .select("*, workout_exercises(*, exercises(*), sets(*))")
                   .eq("user_id", user_id)
                   .order("date", desc=True)
                   .execute())
        
        # Mapping logic for FE
        workouts_data = response.data
        for workout in workouts_data:
            workout["exercises"] = []
            for we in workout.get("workout_exercises", []):
                fe_ex = {
                    "id": we["exercises"]["id"],
                    "name": we["exercises"]["name"],
                    "muscleGroup": we["exercises"]["muscle_group"],
                    "sets": we["sets"],
                    "workout_exercise_id": we["id"]
                }
                workout["exercises"].append(fe_ex)
            del workout["workout_exercises"]
            
        return workouts_data

    @staticmethod
    async def create_workout(user_id: str, workout_data: WorkoutCreate) -> dict:
        supabase = get_supabase()
        
        # 1. Insert Workout
        workout_res = supabase.table("workouts").insert({
            "user_id": user_id,
            "name": workout_data.name,
            "date": workout_data.date.isoformat(),
            "duration_minutes": workout_data.duration_minutes,
            "notes": workout_data.notes
        }).execute()
        
        workout = workout_res.data[0]
        workout_id = workout["id"]
        
        # 2. Process Exercises and Sets
        for ex_data in workout_data.exercises:
            # Get or create exercise
            ex_res = supabase.table("exercises").select("id").eq("name", ex_data.name).execute()
            if not ex_res.data:
                ex_res = supabase.table("exercises").insert({
                    "name": ex_data.name,
                    "muscle_group": ex_data.muscle_group.value
                }).execute()
            
            exercise_id = ex_res.data[0]["id"]
            
            # Create WorkoutExercise
            we_res = supabase.table("workout_exercises").insert({
                "workout_id": workout_id,
                "exercise_id": exercise_id,
                "order_index": 0 # Simplification
            }).execute()
            
            we_id = we_res.data[0]["id"]
            
            # Create Sets
            sets_to_insert = [
                {
                    "workout_exercise_id": we_id,
                    "reps": s.reps,
                    "weight": s.weight,
                    "speed": s.speed,
                    "incline": s.incline,
                    "time_seconds": s.time_seconds,
                    "calories_burnt": s.calories_burnt,
                    "steps": s.steps,
                    "completed": s.completed,
                    "set_order": i
                }
                for i, s in enumerate(ex_data.sets)
            ]
            if sets_to_insert:
                supabase.table("sets").insert(sets_to_insert).execute()

            # --- Template Auto-update Logic (Progressive Overload) ---
            if workout_data.template_id:
                if ex_data.sets:
                    first_set = ex_data.sets[0]
                    supabase.table("workout_template_exercises").update({
                        "default_reps": first_set.reps,
                        "default_weight": first_set.weight,
                        "default_speed": first_set.speed,
                        "default_incline": first_set.incline,
                        "default_time_seconds": first_set.time_seconds,
                        "default_calories_burnt": first_set.calories_burnt,
                        "default_steps": first_set.steps
                    }).eq("template_id", str(workout_data.template_id)).eq("exercise_id", exercise_id).execute()

        # 3. Save as Template if requested
        if workout_data.save_as_template:
            template_create = TemplateCreate(
                name=workout_data.name,
                description=f"Saved from workout on {workout_data.date.strftime('%Y-%m-%d')}",
                exercises=[
                    TemplateExerciseCreate(
                        exercise_id=UUID(supabase.table("exercises").select("id").eq("name", ex.name).single().execute().data["id"]),
                        default_sets=len(ex.sets),
                        default_reps=ex.sets[0].reps if ex.sets else 10,
                        default_weight=ex.sets[0].weight if ex.sets else 0,
                        default_speed=ex.sets[0].speed if ex.sets else None,
                        default_incline=ex.sets[0].incline if ex.sets else None,
                        default_time_seconds=ex.sets[0].time_seconds if ex.sets else None,
                        default_calories_burnt=ex.sets[0].calories_burnt if ex.sets else 60,
                        default_steps=ex.sets[0].steps if ex.sets else 0,
                        order_index=i
                    )
                    for i, ex in enumerate(workout_data.exercises)
                ]
            )
            await TemplateService.create_template(user_id, template_create)

        return workout

    @staticmethod
    async def get_workout_by_id(workout_id: str) -> dict:
        supabase = get_supabase()
        response = (supabase.table("workouts")
                   .select("*, workout_exercises(*, exercises(*), sets(*))")
                   .eq("id", workout_id)
                   .single()
                   .execute())
        
        if not response.data:
            return None
            
        workout = response.data
        workout["exercises"] = []
        for we in workout.get("workout_exercises", []):
            fe_ex = {
                "id": we["exercises"]["id"],
                "name": we["exercises"]["name"],
                "muscleGroup": we["exercises"]["muscle_group"],
                "sets": we["sets"],
                "workout_exercise_id": we["id"]
            }
            workout["exercises"].append(fe_ex)
        del workout["workout_exercises"]
        
        return workout

    @staticmethod
    async def get_last_performance(user_id: str, exercise_names: List[str]) -> List[dict]:
        supabase = get_supabase()
        results = []
        
        for name in exercise_names:
            query = (supabase.table("sets")
                    .select("weight, reps, speed, incline, time_seconds, calories_burnt, steps, workout_exercises!inner(workout_id, workouts!inner(date, name), exercises!inner(name))")
                    .eq("workout_exercises.exercises.name", name)
                    .eq("workout_exercises.workouts.user_id", user_id)
                    .order("workout_exercises.workouts.date", desc=True)
                    .limit(1)
                    .execute())
            
            if query.data:
                s = query.data[0]
                results.append({
                    "exerciseName": name,
                    "lastWeight": float(s["weight"]) if s["weight"] is not None else 0,
                    "lastReps": s["reps"] if s["reps"] is not None else 0,
                    "lastSpeed": float(s["speed"]) if s["speed"] is not None else 0,
                    "lastIncline": float(s["incline"]) if s["incline"] is not None else 0,
                    "lastTimeSeconds": s["time_seconds"] if s["time_seconds"] is not None else 0,
                    "lastCaloriesBurnt": float(s["calories_burnt"]) if s["calories_burnt"] is not None else 0,
                    "lastSteps": s["steps"] if s.get("steps") is not None else 0,
                    "lastDate": s["workout_exercises"]["workouts"]["date"]
                })
            else:
                results.append({
                    "exerciseName": name,
                    "lastWeight": 0,
                    "lastReps": 0,
                    "lastSpeed": 0,
                    "lastIncline": 0,
                    "lastTimeSeconds": 0,
                    "lastCaloriesBurnt": 0,
                    "lastSteps": 0,
                    "lastDate": ""
                })
                
        return results
