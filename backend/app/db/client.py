import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
# Prefer Service Role key if available for administrative/backend access
key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_KEY")

if not url or not key:
    print("Warning: Missing SUPABASE_URL or SUPABASE_KEY/SERVICE_ROLE_KEY env vars")

supabase: Client = create_client(url, key)

def get_supabase() -> Client:
    return supabase
