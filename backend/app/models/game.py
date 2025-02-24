import uuid
from sqlalchemy import TIMESTAMP, Column, Integer, String, ForeignKey, text
from app.core.database import Base
from app.core.constants import GameStatus, Winner


class Game(Base):
    __tablename__ = "games"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    player_white_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    # Opponent can join later
    player_black_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    fen = Column(String, default="startpos")  # Use FEN notation for board state
    # Status: waiting, ongoing, finished
    status = Column(String, default=GameStatus.WAITING)
    winner = Column(String, default=Winner.ONGOING)
    created_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))
    updated_at = Column(
        TIMESTAMP,
        server_default=text("CURRENT_TIMESTAMP"),
        onupdate=text("CURRENT_TIMESTAMP"),
    )
