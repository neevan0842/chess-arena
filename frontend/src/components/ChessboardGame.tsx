import { Chessboard } from "react-chessboard";

interface ChessboardGameProps {
  position: string;
  onPieceDrop: (
    sourceSquare: string,
    targetSquare: string
  ) => boolean | Promise<boolean>;
}

const ChessboardGame: React.FC<ChessboardGameProps> = ({
  position,
  onPieceDrop,
}) => {
  if (position === "startpos") {
    position = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";
  }
  return (
    <div className="w-96">
      {/* <h1 className="">hello</h1> */}
      <Chessboard position={position} onPieceDrop={onPieceDrop} />
    </div>
  );
};

export default ChessboardGame;
