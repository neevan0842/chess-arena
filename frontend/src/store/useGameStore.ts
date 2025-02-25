import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { Chess } from "chess.js";
interface GameState {
  gameId: number | null;
  fen: string;
  game: Chess;
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
  updateFen: (fen: string) => void;
  resetGame: () => void;
}

const useGameStore = create<GameState>()(
  persist(
    immer((set) => ({
      gameId: null,
      fen: "startpos",
      game: new Chess(),
      status: null,
      winner: null,
      // next_turn: null,
      setGame: (gameId, fen, status) => {
        set((state) => {
          state.gameId = gameId;
          state.fen = fen;
          state.status = status;
          if (fen === "startpos") {
            state.game = new Chess();
          } else {
            state.game = new Chess(fen);
          }
        });
      },
      // updateGame: (fen,status,winner,next_turn) => set({ fen,status,winner,next_turn }),
      updateGame: (fen, status, winner) => {
        set((state) => {
          state.fen = fen;
          state.status = status;
          state.winner = winner;
          if (fen === "startpos") {
            state.game = new Chess();
          } else {
            state.game = new Chess(fen);
          }
        });
      },
      updateFen: (fen) => {
        set((state) => {
          state.fen = fen;
          if (fen === "startpos") {
            state.game = new Chess();
          } else {
            state.game = new Chess(fen);
          }
        });
      },
      resetGame: () => {
        set((state) => {
          state.gameId = null;
          state.fen = "startpos";
          state.game = new Chess();
          state.status = null;
          state.winner = null;
        });
      },
    })),
    {
      name: "game-storage", // This key is used for localStorage persistence.
    }
  )
);

export default useGameStore;
