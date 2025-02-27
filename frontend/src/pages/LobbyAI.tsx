import { createGameAI } from "@/api/gameApi";
import { Button } from "@/components/ui/button"; // Ensure this path is correct
import useGameStore from "@/store/useGameStore";
import useResultStore from "@/store/useResultStore";
import { AIDifficulty, Player } from "@/utils/constants";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

const LobbyAI = () => {
  const navigate = useNavigate();
  const { setGame, resetGame } = useGameStore();
  const { resetResult } = useResultStore();

  const handleClicked = async (difficulty: AIDifficulty) => {
    try {
      const data = await createGameAI(difficulty);
      if (!data) {
        toast.error("Failed to create game");
        return;
      }
      resetGame();
      resetResult();
      setGame(data.id, data.fen, data.status, Player.WHITE);
      toast.success(`Game created! White. Difficulty: ${difficulty}`);
      navigate("/ai");
    } catch (error) {
      toast.error("Failed to create game");
    }
  };

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/chessLanding.jpg')" }}
    >
      {/* Dimming Overlay (Ensures background is darker but not the content) */}
      <div className="absolute inset-0 bg-black/60"></div>

      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded hover:bg-gray-300 transition-colors"
      >
        ← Back
      </button>
      {/* Content Wrapper (Z-index ensures it stays above the dimming layer) */}
      <div className="relative z-10 flex flex-col space-y-4 bg-gray-200 p-6 rounded-lg shadow-xl w-72">
        <h1 className="text-black text-center text-2xl font-semibold">
          Select Difficulty
        </h1>
        <Button
          onClick={() => handleClicked(AIDifficulty.EASY)}
          className="bg-gray-700 text-white hover:bg-gray-800 transition-all rounded-md py-3"
        >
          Easy
        </Button>
        <Button
          onClick={() => handleClicked(AIDifficulty.MEDIUM)}
          className="bg-gray-800 text-white hover:bg-gray-900 transition-all rounded-md py-3"
        >
          Medium
        </Button>
        <Button
          onClick={() => handleClicked(AIDifficulty.HARD)}
          className="bg-black text-white hover:bg-gray-950 transition-all rounded-md py-3"
        >
          Hard
        </Button>
      </div>
    </div>
  );
};

export default LobbyAI;
