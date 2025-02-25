import { apiAuthenticated } from "./api";

const createGame = async () => {
  try {
    const response = await apiAuthenticated.post("/api/v1/game/create", {});
    if (!response) {
      console.error("Failed to create game", response);
      return;
    }
    return response.data;
  } catch (error) {
    console.error("Failed to create game", error);
  }
};

const joinGame = async (gameId: number) => {
  try {
    const response = await apiAuthenticated.post("/api/v1/game/join", {
      game_id: gameId,
    });
    if (!response) {
      console.error("Failed to join game", response);
      return;
    }
    return response.data;
  } catch (error) {
    console.error("Failed to join game", error);
  }
};

const moveGame = async (gameId: number, move: string) => {
  try {
    const response = await apiAuthenticated.post("/api/v1/game/move", {
      game_id: gameId,
      move: move,
    });
    if (!response) {
      console.error("Failed to move game", response);
      return;
    }
    return response.data;
  } catch (error) {
    console.error("Failed to move game", error);
  }
};

const resignGame = async (gameId: number) => {
  try {
    const response = await apiAuthenticated.post("/api/v1/game/resign", {
      game_id: gameId,
    });
    if (!response) {
      console.error("Failed to resign game", response);
      return;
    }
    return response.data;
  } catch (error) {
    console.error("Failed to resign game", error);
  }
};

export { createGame, joinGame, moveGame, resignGame };
