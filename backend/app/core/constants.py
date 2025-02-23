from enum import Enum


class GameStatus(str, Enum):
    WAITING = "waiting"
    ONGOING = "ongoing"
    FINISHED = "finished"
