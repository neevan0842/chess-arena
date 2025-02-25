import useGameStore from "@/store/useGameStore";
import { Chess, Square } from "chess.js";
import { useState } from "react";
import { Chessboard } from "react-chessboard";

interface ChessboardGameProps {
  game: Chess;
  handleMove: (move: string) => Promise<boolean>;
}

const ChessboardGame: React.FC<ChessboardGameProps> = ({
  game,
  handleMove,
}) => {
  const { updateFen } = useGameStore();
  const [moveFrom, setMoveFrom] = useState("");
  const [moveTo, setMoveTo] = useState<Square | null>(null);
  const [rightClickedSquares, setRightClickedSquares] = useState({});
  const [optionSquares, setOptionSquares] = useState({});

  //Function to get possible move options from a given square.
  function getMoveOptions(square: Square) {
    // Retrieve all possible moves from the selected square, with detailed info.
    const moves = game.moves({
      square,
      verbose: true,
    });
    // If no moves are available, clear optionSquares and return false.
    if (moves.length === 0) {
      setOptionSquares({});
      return false;
    }
    // Create a new object to hold the style for each target square.
    const newSquares: Record<string, any> = {};
    moves.map((move) => {
      // Set a different radial gradient background depending on whether the target
      // square contains an opponent's piece or is empty.
      newSquares[move.to] = {
        background:
          game.get(move.to) &&
          game.get(move.to)?.color !== game.get(square)?.color
            ? "radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)"
            : "radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)",
        borderRadius: "50%",
      };
      return move; // returning move is optional since we’re not using the result.
    });
    // Highlight the currently selected square.
    newSquares[square] = {
      background: "rgba(255, 255, 0, 0.4)",
    };
    // Update the state to reflect these option styles.
    setOptionSquares(newSquares);
    return true;
  }

  //Handler function for when a square on the board is clicked.
  async function onSquareClick(square: Square) {
    // Clear any right-click highlights.
    setRightClickedSquares({});

    // If no square has been selected as the starting point...
    if (!moveFrom) {
      // Attempt to get move options from the clicked square.
      const hasMoveOptions = getMoveOptions(square);
      // If valid moves exist from that square, set it as the starting square.
      if (hasMoveOptions) setMoveFrom(square);
      return;
    }

    // If a starting square is already selected, this click should be the destination.
    if (!moveTo) {
      // Get possible moves from the previously selected starting square.
      const moves = game.moves({
        square: moveFrom as Square,
        verbose: true,
      });
      // Find the move that matches the intended destination.
      const foundMove = moves.find(
        (m) => m.from === moveFrom && m.to === square
      );
      // If the move is not valid...
      if (!foundMove) {
        // Check if the newly clicked square can serve as a starting point.
        const hasMoveOptions = getMoveOptions(square);
        // If yes, update the starting square; if not, clear the selection.
        setMoveFrom(hasMoveOptions ? square : "");
        return;
      }

      // A valid destination square was selected.
      setMoveTo(square);

      // Determine if this move is a promotion move
      const isPromotion =
        (foundMove.color === "w" &&
          foundMove.piece === "p" &&
          square[1] === "8") ||
        (foundMove.color === "b" &&
          foundMove.piece === "p" &&
          square[1] === "1");

      // Process a move
      // Make a copy of the current game.
      const gameCopy = new Chess(game.fen());
      const previousFen = gameCopy.fen();
      // Attempt the move (defaulting promotion to queen).
      const move = gameCopy.move({
        from: moveFrom,
        to: square,
        promotion: "q",
      });

      // If the move is invalid, try updating the starting square instead.
      if (move === null) {
        const hasMoveOptions = getMoveOptions(square);
        if (hasMoveOptions) setMoveFrom(square);
        return;
      }
      // Update the game state with the valid move.
      // setGame(gameCopy);
      updateFen(gameCopy.fen());
      // Send the move to the server.
      const moveString = `${moveFrom}${square}${isPromotion ? "=Q" : ""}`;
      const response = await handleMove(moveString);
      if (!response) {
        // If the move failed, undo move
        updateFen(previousFen);
      }

      // Reset the move selections and clear move options.
      setMoveFrom("");
      setMoveTo(null);
      setOptionSquares({});
      return;
    }
  }

  //Handler for right-click events on squares.
  function onSquareRightClick(square: Square) {
    const colour = "rgba(0, 0, 255, 0.4)";

    setRightClickedSquares((prev) => ({
      ...prev,
      [square]:
        (prev as any)[square]?.backgroundColor === colour
          ? undefined
          : { backgroundColor: colour },
    }));
  }

  return (
    <div className="w-96">
      {/* <h1 className="">hello</h1> */}
      {/* <Chessboard position={game.fen()} /> */}
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
        promotionToSquare={moveTo}
      />
    </div>
  );
};

export default ChessboardGame;
