import { moveGame, resignGame } from "@/api/gameApi";
import { useGameWebSocket } from "@/hooks/useGameWebSocket";
import useGameStore from "@/store/useGameStore";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import ChessboardGame from "../components/ChessboardGame";
import ResultModel from "../components/ResultModel";
import { Player } from "@/utils/constants";

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

  useEffect(() => {
    if (!useGameStore.getState().gameId) {
      navigate("/lobby");
    }
  }, []);

  return (
    <div className="flex justify-center items-center h-screen bg-orange-200">
      <div className="">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 px-4 py-2 bg-orange-800 text-white font-semibold rounded hover:bg-orange-900 transition-colors"
        >
          ← Back
        </button>
        <div className="text-center mb-4">
          <h1 className="text-2xl font-semibold">
            Game Code: <span className="font-mono">{gameId}</span>
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
