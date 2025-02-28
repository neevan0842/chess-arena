import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import {
  fetchUserProfile,
  getAccessTokenWithRefreshToken,
  getOauthGoogleUrl,
  loginUser,
  logoutUser,
  OauthGoogleCallback,
  registerUser,
  UserInterface,
} from "../api/authApi";

interface AuthState {
  accessToken: string | null;
  user: UserInterface | null;
  isLoggedIn: boolean;
  // Actions:
  login: (username: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<void>;
  getGoogleUrl: () => Promise<string | null>;
  googleCallback: (code: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  fetchProfile: () => Promise<void>;
}

// A small helper to reset auth-related state
function resetAuthState(set: (fn: (state: AuthState) => void) => void) {
  set((state) => {
    state.accessToken = null;
    state.user = null;
    state.isLoggedIn = false;
  });
}

const useAuthStore = create<AuthState>()(
  persist(
    immer((set) => ({
      accessToken: null,
      user: null,
      isLoggedIn: false,

      // Login: call your login API.
      login: async (username: string, password: string) => {
        const response = await loginUser({ username, password });
        if (!response || !response?.access_token) {
          resetAuthState(set);
          return;
        }
        set((state) => {
          state.accessToken = response.access_token;
        });
        const userProfile = await fetchUserProfile();
        if (!userProfile || !userProfile?.id) {
          resetAuthState(set);
          return;
        }
        set((state) => {
          state.user = userProfile;
          state.isLoggedIn = true;
        });
        return;
      },

      // Register: call your register API.
      register: async (username: string, email: string, password: string) => {
        const data = await registerUser({ username, email, password });
        if (!data || !data?.id) {
          resetAuthState(set);
          return;
        } else {
          set((state) => {
            state.user = data;
          });
        }
        return;
      },

      // Get Google OAuth URL
      getGoogleUrl: async () => {
        const response = await getOauthGoogleUrl();
        if (!response || !response?.url) {
          resetAuthState(set);
          return null;
        }
        return response.url;
      },

      // Google OAuth callback
      googleCallback: async (code: string) => {
        const response = await OauthGoogleCallback(code);
        if (!response || !response?.access_token) {
          resetAuthState(set);
          return;
        }
        set((state) => {
          state.accessToken = response.access_token;
        });
        const userProfile = await fetchUserProfile();
        if (!userProfile || !userProfile?.id) {
          resetAuthState(set);
          return;
        }
        set((state) => {
          state.accessToken = response.access_token;
          state.user = userProfile;
          state.isLoggedIn = true;
        });
        return;
      },

      // Logout: clear auth state.
      logout: async () => {
        const response = await logoutUser();
        if (response && response?.message) {
          resetAuthState(set);
          return;
        }
      },

      // Refresh the access token using the backend endpoint.
      // The refresh token is read from the httpOnly cookie.
      refreshAccessToken: async () => {
        const response = await getAccessTokenWithRefreshToken();
        if (!response || !response?.access_token) {
          resetAuthState(set);
          return;
        }
        set((state) => {
          state.accessToken = response.access_token;
        });
      },

      // Fetch and store the user's profile.
      fetchProfile: async () => {
        const userProfile = await fetchUserProfile();
        if (!userProfile || !userProfile?.id) {
          resetAuthState(set);
          return;
        }
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
