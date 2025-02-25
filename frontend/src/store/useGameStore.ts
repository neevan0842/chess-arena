import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

interface GameState {
  gameId: number | null;
  fen: string;
  player: "white" | "black" | null;
  status: "waiting" | "ongoing" | "finished" | null;
  winner: "white" | "black" | "ongoing" | "draw" | null;
  setGame: (
    gameId: number,
    fen: string,
    status: "waiting" | "ongoing" | "finished",
    player: "white" | "black"
  ) => void;
  updateGame: (
    fen: string,
    status: "waiting" | "ongoing" | "finished",
    winner: "white" | "black" | "draw" | "ongoing"
  ) => void;
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
      winner: null,
      setGame: (gameId, fen, status, player) => {
        set((state) => {
          state.gameId = gameId;
          state.fen = fen;
          state.status = status;
          state.player = player;
        });
      },
      updateGame: (fen, status, winner) => {
        set((state) => {
          state.fen = fen;
          state.status = status;
          state.winner = winner;
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
          state.winner = null;
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
