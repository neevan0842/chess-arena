import { moveGame } from "@/api/gameApi";
import { useGameWebSocket } from "@/hooks/useGameWebSocket";
import useGameStore from "@/store/useGameStore";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import ChessboardGame from "./ChessboardGame";

const MultiplayerGame = () => {
  const navigate = useNavigate();
  const { gameId, fen } = useGameStore();

  useGameWebSocket();

  const handlePieceDrop = async (
    sourceSquare: string,
    targetSquare: string
  ) => {
    const move = `${sourceSquare}-${targetSquare}`;
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

  useEffect(() => {
    if (!useGameStore.getState().gameId) {
      navigate("/lobby");
    }
  }, []);

  return (
    <div className="flex justify-center items-center h-screen bg-orange-200">
      <div className="">
        <h1 className="mb-4">{`Chess Game : ${
          useGameStore.getState().gameId
        }`}</h1>
        <ChessboardGame position={fen} onPieceDrop={handlePieceDrop} />
      </div>
    </div>
  );
};

export default MultiplayerGame;
