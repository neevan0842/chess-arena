import { moveGame, resignGame } from "@/api/gameApi";
import { useGameWebSocket } from "@/hooks/useGameWebSocket";
import useGameStore from "@/store/useGameStore";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import ChessboardGame from "./ChessboardGame";

const MultiplayerGame = () => {
  const navigate = useNavigate();
  const { gameId, game } = useGameStore();

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

  useEffect(() => {
    if (!useGameStore.getState().gameId) {
      navigate("/lobby");
    }
  }, []);

  return (
    <div className="flex justify-center items-center h-screen bg-orange-200">
      <div className="">
        <h1 className="mb-4">{`Chess Game : ${gameId}`}</h1>
        <ChessboardGame game={game} handleMove={handleMove} />
        <button
          onClick={handleResign}
          className="mt-6 px-4 py-2 bg-orange-800 text-white font-semibold rounded hover:bg-orange-900 transition-colors"
        >
          Resign
        </button>
      </div>
    </div>
  );
};

export default MultiplayerGame;
