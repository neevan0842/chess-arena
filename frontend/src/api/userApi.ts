import { apiAuthenticated, apiUnauthenticated } from "./api";
import { UserInterface } from "./authApi";

interface UserStatsInterface {
  totalGames: number;
  multiplayerWins: number;
  multiplayerLosses: number;
  multiplayerWinRate: string;
  mostPlayedColor?: "White" | "Black" | null;
  bestStreak: number;
  aiGames: number;
  aiWins: number;
  aiLosses: number;
  aiWinRate: string;
}

interface RecentGameInterface {
  opponentUsername: string;
  opponentId: string | null;
  result: "win" | "loss" | "draw";
  game_type: "multiplayer" | "ai";
  date: Date;
}

const getUserData = async (username: string): Promise<UserInterface | null> => {
  try {
    const response = await apiUnauthenticated.get(`/api/v1/users/${username}`);
    if (response.status !== 200) {
      console.error(response);
      return null;
    }
    const data: UserInterface = {
      ...response.data,
      created_at: new Date(response.data.created_at),
    };
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const getUserStats = async (
  username: string
): Promise<UserStatsInterface | null> => {
  try {
    const response = await apiUnauthenticated.get(
      `/api/v1/users/${username}/stats`
    );
    if (response.status !== 200) {
      console.error(response);
      return null;
    }
    const data: UserStatsInterface = {
      totalGames: response.data.total_games,
      multiplayerWins: response.data.multiplayer_wins,
      multiplayerLosses: response.data.multiplayer_losses,
      multiplayerWinRate: response.data.multiplayer_win_rate,
      mostPlayedColor: response.data.most_played_color ?? null,
      bestStreak: response.data.best_streak,
      aiGames: response.data.ai_games,
      aiWins: response.data.ai_wins,
      aiLosses: response.data.ai_losses,
      aiWinRate: response.data.ai_win_rate,
    };
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const getRecentGames = async (
  username: string
): Promise<RecentGameInterface[] | null> => {
  try {
    const response = await apiUnauthenticated.get(
      `/api/v1/users/${username}/games`
    );
    if (response.status !== 200) {
      console.error(response);
      return null;
    }
    const data: RecentGameInterface[] = response.data.map((game: any) => ({
      opponentUsername: game.opponent_username,
      opponentId: game.opponent_id ?? null,
      result: game.result,
      game_type: game.game_type,
      date: new Date(game.date),
    }));
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const deleteUser = async () => {
  try {
    const response = await apiAuthenticated.delete(`/api/v1/users/me`);
    if (response.status !== 204) {
      console.error(response);
      return false;
    }
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export { getUserStats, getRecentGames, getUserData, deleteUser };
export type { UserStatsInterface, RecentGameInterface };
