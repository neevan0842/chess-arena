from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.future import select
from app.schemas.auth import UserResponse
from app.models.user import User
from app.services.auth import get_current_active_user
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies import get_db
from app.schemas.users import RecentGameResponse, UserStatsResponse
from app.services.users import get_player_stats, get_recent_games_details


router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserResponse)
async def get_current_user(current_user: User = Depends(get_current_active_user)):
    print(current_user.id, "\n\n\n\n", flush=True)
    print(current_user.username, "\n\n\n\n", flush=True)
    return current_user


@router.get("/{user_id}/stats", response_model=UserStatsResponse)
async def get_user_stats(
    user_id: str,
    db: AsyncSession = Depends(get_db),
):
    stats = await get_player_stats(user_id=user_id, db=db)
    return stats


@router.get("/{user_id}/games", response_model=List[RecentGameResponse])
async def get_recent_games(
    user_id: str,
    db: AsyncSession = Depends(get_db),
):
    recent_games = await get_recent_games_details(user_id=user_id, db=db)
    return recent_games


@router.get("/{user_id}", response_model=UserResponse)
async def get_user_by_id(user_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    return user
