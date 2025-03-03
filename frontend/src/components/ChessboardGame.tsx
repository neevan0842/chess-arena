import useGameStore from "@/store/useGameStore";
import { GameStatus, Player } from "@/utils/constants";
import { Chess, Square } from "chess.js";
import { useEffect, useState, useCallback } from "react";
import { Chessboard } from "react-chessboard";
import toast from "react-hot-toast";

interface ChessboardGameProps {
  handleMove: (move: string) => Promise<boolean>;
  setNextMove: (nextMove: Player) => void;
}

const ChessboardGame: React.FC<ChessboardGameProps> = ({
  handleMove,
  setNextMove,
}) => {
  const { fen, player, status, updateFen } = useGameStore();
  const [game, setGame] = useState(
    new Chess(fen === "startpos" ? undefined : fen)
  );
  const [moveFrom, setMoveFrom] = useState<Square | null>(null);
  const [optionSquares, setOptionSquares] = useState<Record<string, any>>({});
  const [rightClickedSquares, setRightClickedSquares] = useState<
    Record<string, any>
  >({});

  /**
   * Updates the player's turn state
   */
  useEffect(() => {
    setNextMove(game.turn() === "w" ? Player.WHITE : Player.BLACK);
  }, [game, setNextMove]);

  /**
   * Resets the board state whenever FEN updates
   */
  useEffect(() => {
    setGame(new Chess(fen === "startpos" ? undefined : fen));
  }, [fen]);

  // useEffect will check for check status after every move
  useEffect(() => {
    if (game.inCheck()) {
      toast(`Check! ${game.turn() === "w" ? "White" : "Black"} is in check!`, {
        icon: "⚠️",
      });
    }
  }, [game.fen()]); // Runs when FEN (game state) changes

  /**
   * Highlights available moves for the selected piece
   */
  const getMoveOptions = useCallback(
    (square: Square) => {
      const moves = game.moves({ square, verbose: true });
      if (!moves.length) {
        setOptionSquares({});
        return false;
      }

      const newSquares: Record<string, any> = {};
      moves.forEach((move) => {
        newSquares[move.to] = {
          background:
            game.get(move.to) &&
            game.get(move.to)?.color !== game.get(square)?.color
              ? "radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)"
              : "radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)",
          borderRadius: "50%",
        };
      });

      newSquares[square] = { background: "rgba(255, 255, 0, 0.4)" };
      setOptionSquares(newSquares);
      return true;
    },
    [game]
  );

  /**
   * Handles move logic when a square is clicked
   */
  const onSquareClick = async (square: Square) => {
    setRightClickedSquares({});

    if (status === GameStatus.WAITING) {
      toast.error("Waiting for Player to join");
      return;
    }

    // If no starting square is selected
    if (!moveFrom) {
      const piece = game.get(square);
      if (!piece || piece.color !== (player === Player.WHITE ? "w" : "b"))
        return;

      if (getMoveOptions(square)) setMoveFrom(square);
      return;
    }

    // If move destination is selected
    const moves = game.moves({ square: moveFrom, verbose: true });
    const foundMove = moves.find((m) => m.from === moveFrom && m.to === square);

    if (!foundMove) {
      if (getMoveOptions(square)) setMoveFrom(square);
      return;
    }

    const gameCopy = new Chess(game.fen());
    const previousFen = gameCopy.fen();
    const move = gameCopy.move({
      from: moveFrom,
      to: square,
      promotion: "q",
    });

    if (!move) {
      if (getMoveOptions(square)) setMoveFrom(square);
      return;
    }

    setGame(gameCopy);
    updateFen(gameCopy.fen());

    const moveString = `${moveFrom}${square}${
      foundMove.flags.includes("p") ? "=Q" : ""
    }`;
    const response = await handleMove(moveString);

    if (!response) {
      setGame(new Chess(previousFen));
      updateFen(previousFen);
    }

    setMoveFrom(null);
    setOptionSquares({});
  };

  /**
   * Handles right-click events to mark squares
   */
  const onSquareRightClick = (square: Square) => {
    const highlightColor = "rgba(0, 0, 255, 0.4)";
    setRightClickedSquares((prev) => ({
      ...prev,
      [square]:
        prev[square]?.backgroundColor === highlightColor
          ? undefined
          : { backgroundColor: highlightColor },
    }));
  };

  return (
    <div className="w-full max-w-xs md:w-96">
      <Chessboard
        id="ClickToMove"
        animationDuration={200}
        arePiecesDraggable={false}
        position={game.fen()}
        onSquareClick={onSquareClick}
        onSquareRightClick={onSquareRightClick}
        customBoardStyle={{
          borderRadius: "4px",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
        }}
        customSquareStyles={{
          ...optionSquares,
          ...rightClickedSquares,
        }}
        boardOrientation={player === Player.BLACK ? "black" : "white"}
      />
    </div>
  );
};

export default ChessboardGame;
