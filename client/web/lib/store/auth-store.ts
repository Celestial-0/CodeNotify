/**
 * Authentication Store
 * Global state management for authentication using Zustand
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AuthService, httpClient } from '@/lib/api';
import type { SigninFormData, SignupFormData } from '@/lib/types/auth.types';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  signin: (credentials: SigninFormData) => Promise<void>;
  signup: (data: SignupFormData) => Promise<void>;
  signout: () => Promise<void>;
  clearError: () => void;
  initialize: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // State
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          error: null,
        }),

      setLoading: (loading) =>
        set({
          isLoading: loading,
        }),

      setError: (error) =>
        set({
          error,
          isLoading: false,
        }),

      signin: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await AuthService.signin(credentials);
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      signup: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await AuthService.signup(data);
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Sign up failed';
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      signout: async () => {
        set({ isLoading: true, error: null });
        try {
          await AuthService.signout();
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to sign out';
          set({
            error: message,
            isLoading: false,
          });
          throw error;
        }
      },

      clearError: () => set({ error: null }),

      initialize: () => {
        // Check if user is authenticated on app load
        // The isAuthenticated check should match the persisted state
        // which is already restored by zustand persist middleware
        const isAuth = httpClient.isAuthenticated();
        set((state) => ({ 
          isAuthenticated: isAuth && !!state.user,
          // If tokens exist but no user in state, clear the inconsistent state
          user: isAuth ? state.user : null,
        }));
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
