from enum import Enum


class GameStatus(str, Enum):
    WAITING = "waiting"
    ONGOING = "ongoing"
    FINISHED = "finished"


class Winner(str, Enum):
    WHITE = "white"
    BLACK = "black"
    DRAW = "draw"
    ONGOING = "ongoing"
