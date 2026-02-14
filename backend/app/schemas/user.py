from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from uuid import UUID

class UserBase(BaseModel):
    username: str
    email: Optional[EmailStr] = None

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: UUID
    is_logged_in: bool = Field(default=True, alias="isLoggedIn") # Mapping to frontend helper
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
