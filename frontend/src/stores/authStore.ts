import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient, ApiResponse } from '../services/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'client' | 'expert' | 'admin';
  avatar?: string;
  isEmailVerified: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: 'client' | 'expert';
  }) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  getCurrentUser: () => Promise<void>;
  updateProfile: (userData: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
  }) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await apiClient.login({ email, password }) as ApiResponse<{ user: User; token: string }>;
          
          if (response.success && response.data) {
            set({
              user: response.data.user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          }
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Login failed',
          });
          throw error;
        }
      },

      register: async (userData) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await apiClient.register(userData) as ApiResponse<{ user: User; token: string }>;
          
          if (response.success && response.data) {
            set({
              user: response.data.user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          }
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Registration failed',
          });
          throw error;
        }
      },

      logout: () => {
        apiClient.clearToken();
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        });
      },

      clearError: () => {
        set({ error: null });
      },

      getCurrentUser: async () => {
        try {
          if (!apiClient.isAuthenticated()) {
            return;
          }

          set({ isLoading: true });
          const response = await apiClient.getCurrentUser() as ApiResponse<{ user: User }>;
          
          if (response.success && response.data) {
            set({
              user: response.data.user,
              isAuthenticated: true,
              isLoading: false,
            });
          }
        } catch (error) {
          // If token is invalid, logout
          get().logout();
          set({ isLoading: false });
        }
      },

      updateProfile: async (userData) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await apiClient.updateProfile(userData) as ApiResponse<{ user: User }>;
          
          if (response.success && response.data) {
            set({
              user: response.data.user,
              isLoading: false,
            });
          }
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Profile update failed',
          });
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
