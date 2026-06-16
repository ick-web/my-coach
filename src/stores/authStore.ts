import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

export type AuthProvider = 'kakao' | 'google' | 'apple' | 'email';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  provider: AuthProvider;
};

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: AuthUser, accessToken: string) => Promise<void>;
  restoreSession: () => Promise<void>;
  logout: () => Promise<void>;
};

const SESSION_KEY = 'mycoach_session';

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: async (user, accessToken) => {
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify({ user, accessToken }));
    set({ user, accessToken, isAuthenticated: true });
  },

  restoreSession: async () => {
    try {
      const raw = await SecureStore.getItemAsync(SESSION_KEY);
      if (raw) {
        const { user, accessToken } = JSON.parse(raw) as { user: AuthUser; accessToken: string };
        set({ user, accessToken, isAuthenticated: true });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync(SESSION_KEY);
    set({ user: null, accessToken: null, isAuthenticated: false });
  },
}));
