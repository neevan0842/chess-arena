from datetime import datetime
from pydantic import BaseModel


class GameResponse(BaseModel):
    id: int
    player_white_id: str
    player_black_id: str | None
    fen: str
    status: str
    created_at: datetime


class JoinRequest(BaseModel):
    game_id: int


class MoveRequest(BaseModel):
    game_id: int
    move: str


class MoveResponse(BaseModel):
    fen: str
    status: str
    winner: str
