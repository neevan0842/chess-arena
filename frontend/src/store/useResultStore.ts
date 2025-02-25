import { Winner } from "@/utils/constants";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

interface ResultState {
  showModel: boolean;
  winner: Winner | null;
  setShowModel: (showModel: boolean) => void;
  setWinner: (winner: Winner) => void;
  resetResult: () => void;
}

const useResultStore = create<ResultState>()(
  persist(
    immer((set) => ({
      showModel: false,
      winner: null,
      setShowModel: (showModel) => {
        set((state) => {
          state.showModel = showModel;
        });
      },
      setWinner: (winner) => {
        set((state) => {
          state.winner = winner;
        });
      },
      resetResult: () => {
        set((state) => {
          state.showModel = false;
          state.winner = null;
        });
      },
    })),
    {
      name: "result-storage", // This key is used for localStorage persistence.
    }
  )
);

export default useResultStore;
