import { create } from 'zustand';
import type { UserPublic, AuthTokens, LoginCredentials, RegisterData } from '../types';
import { auth as authApi } from '../services/api';

interface AuthStoreState {
  user: UserPublic | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDemo: boolean;

  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  setUser: (user: UserPublic | null) => void;
  setIsDemo: (isDemo: boolean) => void;
  initialize: () => Promise<void>;
}

const getStoredTokens = (): AuthTokens | null => {
  try {
    const raw = localStorage.getItem('auth_tokens');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.access_token || parsed?.access) {
      return {
        access_token: parsed.access_token || parsed.access,
        refresh_token: parsed.refresh_token || parsed.refresh || '',
        token_type: parsed.token_type || 'bearer',
      };
    }
    return null;
  } catch {
    return null;
  }
};

const getStoredUser = (): UserPublic | null => {
  try {
    const raw = localStorage.getItem('auth_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const initialTokens = getStoredTokens();
const initialUser = getStoredUser();

export const useAuthStore = create<AuthStoreState>((set, get) => ({
  user: initialUser,
  tokens: initialTokens,
  isAuthenticated: Boolean(initialTokens?.access_token),
  isLoading: false,
  isDemo: false,

  setIsDemo: (isDemo: boolean) => set({ isDemo }),

  setUser: (user: UserPublic | null) => {
    if (user) {
      localStorage.setItem('auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('auth_user');
    }
    set({ user });
  },

  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true });
    try {
      const response = await authApi.login(credentials);
      const tokens: AuthTokens = {
        access_token: response.access_token,
        refresh_token: response.refresh_token,
        token_type: response.token_type,
      };

      const user: UserPublic = {
        id: response.user_id,
        email: response.email,
        full_name: response.full_name,
        is_admin: response.is_admin,
        is_active: true,
        created_at: new Date().toISOString(),
        onboarding_complete: response.onboarding_complete,
      };

      localStorage.setItem('auth_tokens', JSON.stringify(tokens));
      localStorage.setItem('auth_user', JSON.stringify(user));

      set({
        user,
        tokens,
        isAuthenticated: true,
        isLoading: false,
      });

      // Optionally fetch complete fresh user data in background
      try {
        const freshUser = await authApi.getMe();
        if (freshUser) {
          const mergedUser: UserPublic = {
            ...user,
            ...freshUser,
            onboarding_complete: response.onboarding_complete,
          };
          localStorage.setItem('auth_user', JSON.stringify(mergedUser));
          set({ user: mergedUser });
        }
      } catch {
        // Fallback to token response user
      }
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (data: RegisterData) => {
    set({ isLoading: true });
    try {
      const response = await authApi.register(data);
      const tokens: AuthTokens = {
        access_token: response.access_token,
        refresh_token: response.refresh_token,
        token_type: response.token_type,
      };

      const user: UserPublic = {
        id: response.user_id,
        email: response.email,
        full_name: response.full_name,
        is_admin: response.is_admin,
        is_active: true,
        created_at: new Date().toISOString(),
        onboarding_complete: response.onboarding_complete,
      };

      localStorage.setItem('auth_tokens', JSON.stringify(tokens));
      localStorage.setItem('auth_user', JSON.stringify(user));

      set({
        user,
        tokens,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('auth_tokens');
    localStorage.removeItem('auth_user');
    set({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  refreshToken: async () => {
    const { tokens } = get();
    if (!tokens?.refresh_token) {
      get().logout();
      return;
    }

    try {
      const response = await authApi.refreshToken(tokens.refresh_token);
      const newTokens: AuthTokens = {
        access_token: response.access_token,
        refresh_token: response.refresh_token,
        token_type: response.token_type,
      };

      localStorage.setItem('auth_tokens', JSON.stringify(newTokens));
      set({ tokens: newTokens, isAuthenticated: true });
    } catch (error) {
      get().logout();
      throw error;
    }
  },

  initialize: async () => {
    const tokens = getStoredTokens();
    const user = getStoredUser();

    if (tokens?.access_token) {
      set({ tokens, user, isAuthenticated: true, isLoading: true });
      try {
        const freshUser = await authApi.getMe();
        if (freshUser) {
          const merged: UserPublic = {
            ...user,
            ...freshUser,
            onboarding_complete: user?.onboarding_complete ?? freshUser.onboarding_complete,
          };
          localStorage.setItem('auth_user', JSON.stringify(merged));
          set({ user: merged, isLoading: false });
        } else {
          set({ isLoading: false });
        }
      } catch {
        // If token expired and couldn't be refreshed, logout
        if (!user) {
          get().logout();
        }
        set({ isLoading: false });
      }
    } else {
      set({ user: null, tokens: null, isAuthenticated: false, isLoading: false });
    }
  },
}));

export const authStore = {
  login: async (emailOrCredentials: string | LoginCredentials, password?: string) => {
    const creds: LoginCredentials =
      typeof emailOrCredentials === 'string'
        ? { email: emailOrCredentials, password: password || '' }
        : emailOrCredentials;
    await useAuthStore.getState().login(creds);
    return useAuthStore.getState().user;
  },
  register: async (data: RegisterData) => {
    await useAuthStore.getState().register(data);
    return useAuthStore.getState().user;
  },
  logout: () => {
    useAuthStore.getState().logout();
  },
  updateUser: (patch: Partial<UserPublic>) => {
    const current = useAuthStore.getState().user;
    if (current) {
      useAuthStore.getState().setUser({ ...current, ...patch });
    }
  },
  getState: () => useAuthStore.getState(),
};

export default authStore;
