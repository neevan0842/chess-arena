import uuid
from sqlalchemy import TIMESTAMP, Column, ForeignKey, Enum, Integer, String
from sqlalchemy.sql import func
from app.core.database import Base
from app.core.constants import AIDifficulty, GameStatus, GameType, Winner


class Game(Base):
    __tablename__ = "games"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    player_white_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    player_black_id = Column(String(36), ForeignKey("users.id"), nullable=True)

    game_type = Column(Enum(GameType), default=GameType.MULTIPLAYER)
    ai_difficulty = Column(Enum(AIDifficulty), default=AIDifficulty.EASY)

    fen = Column(String, default="startpos")  # Use FEN notation for board state
    status = Column(Enum(GameStatus), default=GameStatus.WAITING)
    winner = Column(Enum(Winner), default=Winner.ONGOING)

    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
