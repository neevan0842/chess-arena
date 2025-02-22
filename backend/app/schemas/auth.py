from datetime import datetime
from pydantic import BaseModel


class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    is_active: bool
    created_at: datetime


class UserRegister(BaseModel):
    username: str
    email: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str


class RefreshResponse(BaseModel):
    access_token: str
    token_type: str
