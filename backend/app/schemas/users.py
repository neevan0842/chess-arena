from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel
from app.core.constants import GameType


class UserStatsResponse(BaseModel):
    total_games: int
    multiplayer_wins: int
    multiplayer_losses: int
    multiplayer_win_rate: str
    most_played_color: Optional[Literal["White", "Black"]]
    best_streak: int
    ai_games: int
    ai_wins: int
    ai_losses: int
    ai_win_rate: str


class RecentGameResponse(BaseModel):
    opponent_username: str
    opponent_id: Optional[str]
    result: Literal["win", "loss", "draw"]
    game_type: GameType
    date: datetime
