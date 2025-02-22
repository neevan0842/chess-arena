import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import {
  fetchUserProfile,
  getAccessTokenWithRefreshToken,
  loginUser,
  logoutUser,
  registerUser,
  UserInterface,
} from "../api/userApi";

interface AuthState {
  accessToken: string | null;
  user: UserInterface | null;
  // Actions:
  login: (username: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<void>;
  fetchProfile: () => Promise<void>;
}

const useAuthStore = create<AuthState>()(
  persist(
    immer((set) => ({
      accessToken: null,
      user: null,

      // Login: call your login API.
      login: async (username: string, password: string) => {
        const response = await loginUser({ username, password });
        if (response && response?.access_token) {
          set((state) => {
            state.accessToken = response.access_token;
          });
          const userProfile = await fetchUserProfile();
          set((state) => {
            state.user = userProfile;
          });
        }
      },

      // Register: call your register API.
      register: async (username: string, email: string, password: string) => {
        await registerUser({ username, email, password });
        // Optionally redirect to login page after registration. TODO
      },

      // Logout: clear auth state.
      logout: async () => {
        const response = await logoutUser();
        if (response && response?.message) {
          set((state) => {
            state.accessToken = null;
            state.user = null;
          });
        }
        // You may want to call an API logout endpoint to clear the refresh token cookie. TODO
      },

      // Refresh the access token using the backend endpoint.
      // The refresh token is read from the httpOnly cookie.
      refreshAccessToken: async () => {
        const response = await getAccessTokenWithRefreshToken();
        if (response && response?.access_token) {
          set((state) => {
            state.accessToken = response.access_token;
          });
        } else {
          set((state) => {
            state.accessToken = null;
            state.user = null;
          });
        }
      },

      // Fetch and store the user's profile.
      fetchProfile: async () => {
        const userProfile = await fetchUserProfile();
        set((state) => {
          state.user = userProfile;
        });
      },
    })),
    {
      name: "auth", // This key is used for localStorage persistence.
      // Note: Only access token and user are persisted.
    }
  )
);

export default useAuthStore;
