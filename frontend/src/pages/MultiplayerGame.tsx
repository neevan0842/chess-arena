import { moveGame, resignGame } from "@/api/gameApi";
import { useGameWebSocket } from "@/hooks/useGameWebSocket";
import useGameStore from "@/store/useGameStore";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import ChessboardGame from "../components/ChessboardGame";
import ResultModel from "../components/ResultModel";
import { Player } from "@/utils/constants";
import { Share2 } from "lucide-react";

const MultiplayerGame = () => {
  const navigate = useNavigate();
  const [nextMove, setNextMove] = useState(Player.WHITE);
  const { gameId, player } = useGameStore();

  useGameWebSocket();

  const handleMove = async (move: string) => {
    try {
      const data = await moveGame(gameId!, move);
      if (!data) {
        toast.error("Failed to move game");
        return false;
      }
      return true;
    } catch (error) {
      toast.error("Failed to move game");
      return false;
    }
  };

  const handleResign = async () => {
    const confirmResign = window.confirm("Are you sure you want to resign?");
    if (!confirmResign) return;

    try {
      const data = await resignGame(gameId!);
      if (!data) {
        toast.error("Failed to resign game");
        return;
      }
    } catch (error) {
      toast.error("Failed to resign game");
    }
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/lobby`;
    const message = `Join my chess game!\nGame Code: ${gameId}\n${shareUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  useEffect(() => {
    if (!useGameStore.getState().gameId) {
      navigate("/lobby");
    }
  }, []);

  return (
    <div className="flex justify-center items-center h-screen bg-orange-200">
      <div className="w-full md:w-auto flex flex-col items-center">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 px-4 py-2 bg-orange-800 text-white font-semibold rounded hover:bg-orange-900 transition-colors z-10"
        >
          ← Back
        </button>
        <div className="text-center mb-4">
          <h1 className="text-2xl font-semibold flex items-center justify-center gap-2">
            Game Code: <span className="font-mono">{gameId}</span>
            <button onClick={handleShare} className="text-orange-800 pb-1">
              <Share2 className="inline w-5 h-5" />
            </button>
          </h1>
          <p className="text-lg text-gray-700">
            You are playing as <span className="font-medium">{player}</span>
          </p>
          <p className="text-lg text-gray-700">
            Next move :<span className="font-medium">{` ${nextMove}`}</span>
          </p>
        </div>

        <ChessboardGame handleMove={handleMove} setNextMove={setNextMove} />

        <button
          onClick={handleResign}
          className="mt-6 px-4 py-2 bg-orange-800 text-white font-semibold rounded hover:bg-orange-900 transition-colors"
        >
          Resign
        </button>
      </div>
      <div>
        <ResultModel />
      </div>
    </div>
  );
};

export default MultiplayerGame;
