from typing import Optional
from pydantic import BaseModel, EmailStr

class UserBase(BaseModel):
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    full_name: Optional[str] = None
    bitrix_contact_id: Optional[int] = None
    role: Optional[str] = "staff"
    is_active: Optional[bool] = True
    addresses_json: Optional[str] = None

class UserCreate(UserBase):
    email: EmailStr
    password: str

class UserUpdate(UserBase):
    password: Optional[str] = None

class UserInDBBase(UserBase):
    id: Optional[int] = None

    class Config:
        from_attributes = True

class User(UserInDBBase):
    pass

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    sub: Optional[str] = None
    email: Optional[str] = None
