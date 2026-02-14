import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_KEY")

if not url or not key:
    print("Error: Missing SUPABASE_URL or SUPABASE_KEY/SUPABASE_SERVICE_ROLE_KEY")
    exit(1)

supabase: Client = create_client(url, key)

def verify_tables():
    # Try to select from each table to verify existence
    tables = [
        "profiles", "exercises", "workouts", "workout_exercises", 
        "sets", "workout_templates", "workout_template_exercises", 
        "meals", "food_items"
    ]
    
    print("Verifying tables...")
    for table in tables:
        try:
            # Select 0 rows just to check if table exists and we have permissions
            supabase.table(table).select("*", count="exact").limit(0).execute()
            print(f"✅ Table '{table}' exists and is accessible.")
        except Exception as e:
            print(f"❌ Error accessing table '{table}': {e}")

if __name__ == "__main__":
    verify_tables()
