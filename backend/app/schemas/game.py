from datetime import datetime
from pydantic import BaseModel
from app.core.constants import AIDifficulty, GameStatus, GameType, Winner


class GameResponse(BaseModel):
    id: int
    player_white_id: str
    player_black_id: str | None
    fen: str
    status: GameStatus
    game_type: GameType
    created_at: datetime


class GameAIRequest(BaseModel):
    ai_difficulty: AIDifficulty


class GameAIResponse(BaseModel):
    id: int
    player_white_id: str
    fen: str
    ai_difficulty: AIDifficulty
    game_type: GameType
    status: GameStatus
    created_at: datetime


class JoinRequest(BaseModel):
    game_id: int


class MoveRequest(BaseModel):
    game_id: int
    move: str


class MoveResponse(BaseModel):
    fen: str
    status: GameStatus
    winner: Winner
