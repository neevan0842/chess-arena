import chess
import chess.engine
from app.core.config import settings


class ChessAIEngine:
    def __init__(
        self,
        engine_path: str = settings.STOCKFISH_PATH,
        difficulty: int = 12,
    ):
        self.engine = chess.engine.SimpleEngine.popen_uci(engine_path)
        self.engine.configure({"Skill Level": difficulty})

    def get_ai_move(self, board: chess.Board, time: float = 0.5) -> chess.Move:
        ai_move = self.engine.play(board, chess.engine.Limit(time=time)).move
        self._close()
        return ai_move

    def _close(self):
        self.engine.quit()
