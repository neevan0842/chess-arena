import { moveGameAI, resignGameAI } from "@/api/gameApi";
import ChessboardGame from "@/components/ChessboardGame";
import ResultModel from "@/components/ResultModel";
import useGameStore from "@/store/useGameStore";
import useResultStore from "@/store/useResultStore";
import { GameStatus, Player } from "@/utils/constants";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

const AIGame = () => {
  const navigate = useNavigate();
  const { setShowModel, setWinner } = useResultStore();
  const [nextMove, setNextMove] = useState(Player.WHITE);
  const { gameId, player, updateGame } = useGameStore();

  const handleMove = async (move: string) => {
    try {
      const data = await moveGameAI(gameId!, move);
      if (!data) {
        toast.error("Failed to move game");
        return false;
      }
      updateGame(data.fen, data.status);
      if (data.status === GameStatus.FINISHED) {
        setTimeout(() => {
          setShowModel(true);
          setWinner(data.winner);
        }, 1000);
      }
      return true;
    } catch (error) {
      toast.error("Failed to move game");
      return false;
    }
  };

  const handleResign = async () => {
    try {
      const data = await resignGameAI(gameId!);
      if (!data) {
        toast.error("Failed to resign game");
        return;
      }
      setShowModel(true);
      setWinner(data.winner);
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

export default AIGame;
