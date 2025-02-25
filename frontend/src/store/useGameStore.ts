import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { GameStatus, Player } from "../utils/constants";

interface GameState {
  gameId: number | null;
  fen: string;
  player: Player | null;
  status: GameStatus | null;
  setGame: (
    gameId: number,
    fen: string,
    status: GameStatus,
    player: Player
  ) => void;
  updateGame: (fen: string, status: GameStatus) => void;
  updateFen: (fen: string) => void;
  resetGame: () => void;
}

const useGameStore = create<GameState>()(
  persist(
    immer((set) => ({
      gameId: null,
      fen: "startpos",
      player: null,
      status: null,
      setGame: (gameId, fen, status, player) => {
        set((state) => {
          state.gameId = gameId;
          state.fen = fen;
          state.status = status;
          state.player = player;
        });
      },
      updateGame: (fen, status) => {
        set((state) => {
          state.fen = fen;
          state.status = status;
        });
      },
      updateFen: (fen) => {
        set((state) => {
          state.fen = fen;
        });
      },
      resetGame: () => {
        set((state) => {
          state.gameId = null;
          state.fen = "startpos";
          state.status = null;
          state.player = null;
        });
      },
    })),
    {
      name: "game-storage", // This key is used for localStorage persistence.
    }
  )
);

export default useGameStore;
