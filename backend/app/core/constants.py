from enum import Enum


class GameStatus(str, Enum):
    WAITING = "waiting"
    ONGOING = "ongoing"
    FINISHED = "finished"


class GameType(str, Enum):
    MULTIPLAYER = "multiplayer"
    AI = "ai"


class Winner(str, Enum):
    WHITE = "white"
    BLACK = "black"
    DRAW = "draw"
    ONGOING = "ongoing"
