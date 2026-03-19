from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional
from datetime import datetime
from uuid import UUID

class UserBase(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
    username: str
    email: Optional[EmailStr] = None

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: UUID
    is_logged_in: bool = Field(default=True, alias="isLoggedIn") # Mapping to frontend helper
    updated_at: Optional[datetime] = None
