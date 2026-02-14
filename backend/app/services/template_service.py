from typing import List, Optional
from uuid import UUID
from app.db.client import get_supabase
from app.schemas.template import TemplateCreate, TemplateUpdate, Template

class TemplateService:
    @staticmethod
    def _format_template(rt: dict) -> dict:
        exercises = []
        for te in (rt.get("workout_template_exercises") or []):
            ex_info = te.get("exercises") or {}
            exercises.append({
                "id": te["id"],
                "exercise_id": te["exercise_id"],
                "default_sets": te.get("default_sets", 3),
                "default_reps": te.get("default_reps", 10),
                "default_weight": float(te.get("default_weight", 0)) if te.get("default_weight") is not None else 0.0,
                "default_speed": float(te.get("default_speed", 0)) if te.get("default_speed") is not None else 0.0,
                "default_incline": float(te.get("default_incline", 0)) if te.get("default_incline") is not None else 0.0,
                "default_time_seconds": te.get("default_time_seconds", 0) if te.get("default_time_seconds") is not None else 0,
                "default_calories_burnt": float(te.get("default_calories_burnt", 60)) if te.get("default_calories_burnt") is not None else 60.0,
                "default_steps": te.get("default_steps", 0) if te.get("default_steps") is not None else 0,
                "order_index": te["order_index"],
                "name": ex_info.get("name") if ex_info else "Unknown",
                "muscle_group": ex_info.get("muscle_group") if ex_info else "Other"
            })
        
        template = {k: v for k, v in rt.items() if k != "workout_template_exercises"}
        template["exercises"] = exercises
        return template

    @staticmethod
    async def get_templates(user_id: str) -> List[dict]:
        supabase = get_supabase()
        response = (supabase.table("workout_templates")
                   .select("*, workout_template_exercises(*, exercises(*))")
                   .eq("user_id", user_id)
                   .execute())
        
        return [TemplateService._format_template(rt) for rt in response.data]

    @staticmethod
    async def create_template(user_id: str, template_data: TemplateCreate) -> dict:
        supabase = get_supabase()
        
        # 1. Insert Template
        template_res = supabase.table("workout_templates").insert({
            "user_id": user_id,
            "name": template_data.name,
            "description": template_data.description
        }).execute()
        
        template_id = template_res.data[0]["id"]
        
        # 2. Insert Template Exercises
        exercises_to_insert = [
            {
                "template_id": template_id,
                "exercise_id": str(ex.exercise_id),
                "default_sets": ex.default_sets,
                "default_reps": ex.default_reps,
                "default_weight": ex.default_weight,
                "default_speed": ex.default_speed,
                "default_incline": ex.default_incline,
                "default_time_seconds": ex.default_time_seconds,
                "default_calories_burnt": ex.default_calories_burnt,
                "default_steps": ex.default_steps,
                "order_index": ex.order_index
            }
            for ex in template_data.exercises
        ]
        
        if exercises_to_insert:
            supabase.table("workout_template_exercises").insert(exercises_to_insert).execute()
            
        # Refetch with exercises
        rt = (supabase.table("workout_templates")
                .select("*, workout_template_exercises(*, exercises(*))")
                .eq("id", template_id)
                .single()
                .execute().data)
        return TemplateService._format_template(rt)

    @staticmethod
    async def update_template(user_id: str, template_id: str, template_data: TemplateUpdate) -> dict:
        supabase = get_supabase()
        
        # Update template basic info
        update_payload = {}
        if template_data.name: update_payload["name"] = template_data.name
        if template_data.description is not None: update_payload["description"] = template_data.description
        
        if update_payload:
            supabase.table("workout_templates").update(update_payload).eq("id", template_id).eq("user_id", user_id).execute()
            
        # Update exercises if provided
        if template_data.exercises is not None:
            supabase.table("workout_template_exercises").delete().eq("template_id", template_id).execute()
            
            exercises_to_insert = [
                {
                    "template_id": template_id,
                    "exercise_id": str(ex.exercise_id),
                    "default_sets": ex.default_sets,
                    "default_reps": ex.default_reps,
                    "default_weight": ex.default_weight,
                    "default_speed": ex.default_speed,
                    "default_incline": ex.default_incline,
                    "default_time_seconds": ex.default_time_seconds,
                    "default_calories_burnt": ex.default_calories_burnt,
                    "default_steps": ex.default_steps,
                    "order_index": ex.order_index
                }
                for ex in template_data.exercises
            ]
            if exercises_to_insert:
                supabase.table("workout_template_exercises").insert(exercises_to_insert).execute()
                
        rt = (supabase.table("workout_templates")
                .select("*, workout_template_exercises(*, exercises(*))")
                .eq("id", template_id)
                .single()
                .execute().data)
        return TemplateService._format_template(rt)

    @staticmethod
    async def delete_template(user_id: str, template_id: str) -> bool:
        supabase = get_supabase()
        supabase.table("workout_templates").delete().eq("id", template_id).eq("user_id", user_id).execute()
        return True
