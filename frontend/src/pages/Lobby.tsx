import React, { useState } from "react";
import { useNavigate } from "react-router";
import useGameStore from "@/store/useGameStore";
import { createGame, joinGame } from "@/api/gameApi";
import toast from "react-hot-toast";
import { Player } from "@/utils/constants";
import useResultStore from "@/store/useResultStore";

const Lobby: React.FC = () => {
  const { setGame, resetGame } = useGameStore();
  const { resetResult } = useResultStore();
  const [joinCode, setJoinCode] = useState("");
  const navigate = useNavigate();

  // Create game handler
  const createNewGame = async () => {
    try {
      const data = await createGame();
      if (!data) {
        toast.error("Failed to create game");
        return;
      }
      resetGame();
      resetResult();
      setGame(data.id, data.fen, data.status, Player.WHITE);
      navigate("/multiplayer");
    } catch (error) {
      toast.error("Failed to create game");
    }
  };

  // Join game handler
  const joinNewGame = async () => {
    try {
      const data = await joinGame(Number(joinCode));
      if (!data) {
        toast.error("Invalid join code");
        return;
      }
      resetGame();
      resetResult();
      setGame(data.id, data.fen, data.status, Player.BLACK);
      navigate("/multiplayer");
    } catch (error) {
      toast.error("Failed to join game");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <div className="w-full max-w-4xl bg-card border border-border rounded-lg shadow-lg p-8">
        <div className="grid grid-cols-1  gap-10">
          <div className="flex flex-col items-center">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-semibold tracking-tight">
                New Game
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                Start a fresh challenge
              </p>
            </div>
            <div className="w-full max-w-sm space-y-4">
              <button
                onClick={createNewGame}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 px-6 rounded-md transition duration-200 shadow-sm"
              >
                Create new Game
              </button>
            </div>
          </div>

          {/* Existing Games Section */}
          <div className="flex flex-col items-center">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-semibold tracking-tight">
                Existing Games
              </h2>
              <p className="text-muted-foreground text-sm">
                Join an ongoing match
              </p>
            </div>
            <div className="w-full max-w-sm space-y-4">
              <div className="flex flex-col">
                <label className="font-medium text-sm text-foreground mb-1">
                  Enter Game Code
                </label>
                <input
                  className="bg-input border border-border text-foreground rounded-md px-3 py-2 focus:ring-2 focus:ring-primary focus:outline-none transition"
                  placeholder="e.g. 10001"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                />
              </div>
              <button
                onClick={joinNewGame}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 px-6 rounded-md transition duration-200 shadow-sm"
              >
                Join Game
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lobby;
