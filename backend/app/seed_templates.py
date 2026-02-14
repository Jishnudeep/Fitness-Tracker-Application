import asyncio
import os
from uuid import UUID
from app.db.client import get_supabase
from app.services.template_service import TemplateService
from app.schemas.template import TemplateCreate, TemplateExerciseCreate

# Note: In a real app, you'd get the user_id from the context. 
# For seeding, we might need a specific user_id or handle it via a CLI argon.
# The user's profile ID is required.

TEMPLATES = [
    {
        "name": "Upper Body",
        "exercises": [
            ("Inclined Dumbell Press", "Chest", 4, 10),
            ("Lat Pull-Downs", "Back", 3, 10),
            ("T Bar Mid Back Rows", "Back", 3, 10),
            ("Machine Lateral Raise", "Shoulders", 3, 10),
            ("Shoulder Press", "Shoulders", 3, 10),
            ("Pec Dec Flyes", "Chest", 3, 10),
            ("Biceps Isolation (Bayesian Curls)", "Arms", 3, 10),
            ("Triceps Isolation (Single arm cable tricep pushdowns)", "Arms", 3, 10),
            ("Cooldown Incline Cardio", "Cardio", 1, 10), # 10 mins represented as 1 set
        ]
    },
    {
        "name": "Lower Body",
        "exercises": [
            ("Romanian Deadlifts/Deadlifts", "Legs", 3, 8),
            ("Lunges", "Legs", 3, 10),
            ("Leg Press", "Legs", 3, 10),
            ("Leg Curls", "Legs", 3, 10),
            ("Calf Raises", "Legs", 3, 10),
            ("Hip Adductors", "Legs", 3, 10),
            ("Hip Abductors", "Legs", 3, 10),
            ("Cable Crunches", "Abs", 3, 10),
            ("Leg Raises (Abs)", "Abs", 3, 10),
        ]
    },
    {
        "name": "Push",
        "exercises": [
            ("Incline DB Press", "Chest", 4, 10),
            ("Chest Press Machine", "Chest", 3, 10),
            ("Lateral Raises", "Shoulders", 3, 10),
            ("Isolateral Decline Chest Press", "Chest", 3, 10),
            ("Dumbell Shoulder Press", "Shoulders", 3, 10),
            ("Triceps Isolation (Long head upper movement)", "Arms", 3, 10),
            ("Cooldown Incline Cardio", "Cardio", 1, 10),
        ]
    },
    {
        "name": "Pull",
        "exercises": [
            ("Assisted Pull-Ups", "Back", 4, 7),
            ("T bar row Upper Back", "Back", 3, 10),
            ("Rear Delts Machine", "Shoulders", 3, 10),
            ("Shrugs", "Back", 3, 10),
            ("Biceps Isolation (Preacher Curl)", "Arms", 3, 10),
            ("Cooldown Incline Cardio", "Cardio", 1, 10),
        ]
    },
    {
        "name": "Legs",
        "exercises": [
            ("Leg Curls", "Legs", 3, 10),
            ("Hack Squats", "Legs", 4, 8),
            ("Hip Thrust", "Legs", 3, 10),
            ("Leg Extensions", "Legs", 3, 10),
            ("Calf Raises", "Legs", 3, 10),
            ("Hip Adductors", "Legs", 3, 10),
            ("Hip Abductors", "Legs", 3, 10),
            ("Cable Crunches", "Abs", 3, 10),
            ("Leg Raises (Abs)", "Abs", 3, 10),
        ]
    }
]

async def seed_user_templates(user_id: str):
    supabase = get_supabase()
    print(f"Seeding templates for user: {user_id}")
    
    for t_data in TEMPLATES:
        exercises_list = []
        for i, (name, mg, sets, reps) in enumerate(t_data["exercises"]):
            # Ensure exercise exists
            ex_res = supabase.table("exercises").select("id").eq("name", name).execute()
            if not ex_res.data:
                ex_res = supabase.table("exercises").insert({
                    "name": name,
                    "muscle_group": mg
                }).execute()
            
            ex_id = ex_res.data[0]["id"]
            
            if mg == "Cardio":
                exercises_list.append(TemplateExerciseCreate(
                    exercise_id=UUID(ex_id),
                    default_sets=sets,
                    default_speed=5.0,
                    default_incline=2.0,
                    default_time_seconds=600,
                    order_index=i
                ))
            else:
                exercises_list.append(TemplateExerciseCreate(
                    exercise_id=UUID(ex_id),
                    default_sets=sets,
                    default_reps=reps,
                    default_weight=50.0,
                    order_index=i
                ))
            
        template_create = TemplateCreate(
            name=t_data["name"],
            description=f"Default {t_data['name']} template",
            exercises=exercises_list
        )
        
        await TemplateService.create_template(user_id, template_create)
        print(f"Created template: {t_data['name']}")

if __name__ == "__main__":
    import sys
    
    async def run_seed():
        # 1. Try to get user_id from command line
        user_id = sys.argv[1] if len(sys.argv) > 1 else None
        
        # 2. If not provided, try to find the latest profile
        if not user_id:
            supabase = get_supabase()
            try:
                res = supabase.table("profiles").select("id").order("id", desc=True).limit(1).execute()
                if res.data:
                    user_id = res.data[0]["id"]
                    print(f"Detected latest user profile: {user_id}")
                else:
                    print("No user profiles found. Please sign up in the UI first.")
                    return
            except Exception as e:
                print(f"Error checking profiles: {e}")
                return
        
        await seed_user_templates(user_id)
        print("Success: Default templates seeded.")

    asyncio.run(run_seed())
