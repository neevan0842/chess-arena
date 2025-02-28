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
    return current_user


@router.get("/{username}/stats", response_model=UserStatsResponse)
async def get_user_stats(
    username: str,
    db: AsyncSession = Depends(get_db),
):
    stats = await get_player_stats(username=username, db=db)
    return stats


@router.get("/{username}/games", response_model=List[RecentGameResponse])
async def get_recent_games(
    username: str,
    db: AsyncSession = Depends(get_db),
):
    recent_games = await get_recent_games_details(username=username, db=db)
    return recent_games


@router.get("/{username}", response_model=UserResponse)
async def get_user_by_id(username: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.username == username))
    user = result.scalars().first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    return user
