from fastapi import Header, HTTPException, Depends
from app.db.client import get_supabase
from typing import Optional

async def get_current_user(authorization: Optional[str] = Header(None)):
    """
    Dependency to verify the Supabase JWT from the Authorization header.
    Expects format: Bearer <token>
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401, 
            detail="Missing or invalid Authorization header"
        )
    
    token = authorization.split(" ")[1]
    supabase = get_supabase()
    
    try:
        # Verify the token with Supabase Auth
        # Note: This checks if the user exists and the token is valid
        res = supabase.auth.get_user(token)
        if not res.user:
            raise HTTPException(status_code=401, detail="Invalid authentication token")
            
        return res.user
    except Exception as e:
        print(f"Auth error: {e}")
        raise HTTPException(status_code=401, detail="Authentication failed")
