import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

interface GameState {
  gameId: number | null;
  fen: string;
  status: "waiting" | "ongoing" | "finished" | null;
  winner: "white" | "black" | "ongoing" | "draw" | null;
  // next_turn: "white" | "black"| null, TODO: Implement this
  setGame: (
    gameId: number,
    fen: string,
    status: "waiting" | "ongoing" | "finished"
  ) => void;
  updateGame: (
    fen: string,
    status: "waiting" | "ongoing" | "finished",
    winner: "white" | "black" | "draw" | "ongoing"
    // next_turn: "white" | "black"| null, TODO: Implement
  ) => void;
  resetGame: () => void;
}

const useGameStore = create<GameState>()(
  persist(
    immer((set) => ({
      gameId: null,
      fen: "startpos",
      status: null,
      winner: null,
      // next_turn: null,
      setGame: (gameId, fen, status) => set({ gameId, fen, status }),
      // updateGame: (fen,status,winner,next_turn) => set({ fen,status,winner,next_turn }),
      updateGame: (fen, status, winner) => set({ fen, status, winner }),
      resetGame: () =>
        set({ gameId: null, fen: "startpos", status: null, winner: null }),
    })),
    {
      name: "game-storage", // This key is used for localStorage persistence.
    }
  )
);

export default useGameStore;
