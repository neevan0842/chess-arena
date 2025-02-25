import useGameStore from "@/store/useGameStore";
import useResultStore from "@/store/useResultStore";
import { useNavigate } from "react-router";

const ResultModel = () => {
  const { showModel, winner, resetResult } = useResultStore();
  const { player, resetGame } = useGameStore();
  const navigate = useNavigate();

  const handleExit = () => {
    resetResult();
    resetGame();
    navigate("/");
  };

  return (
    <div>
      {showModel && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded shadow-md text-center">
            <h2 className="text-2xl font-bold mb-4">
              {winner && winner === "draw"
                ? "It's a Draw!"
                : winner !== player
                ? "You Lost"
                : "You Won"}
            </h2>
            <p className="mb-4">
              Game Over!{" "}
              {winner &&
                (winner === "draw"
                  ? "The game ended in a draw."
                  : `${
                      winner.charAt(0).toUpperCase() + winner.slice(1)
                    } won the game.`)}
            </p>
            <button
              onClick={handleExit}
              className="mt-6 px-4 py-2 bg-orange-800 text-white font-semibold rounded hover:bg-orange-900 transition-colors"
            >
              Exit to Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultModel;
