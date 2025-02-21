from fastapi import APIRouter, Depends

from app.schemas.auth import UserResponse
from app.models.user import User
from app.services.auth import get_current_active_user


router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserResponse)
async def get_current_user(current_user: User = Depends(get_current_active_user)):
    return current_user
