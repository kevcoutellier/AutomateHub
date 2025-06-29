import { create } from 'zustand';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'client' | 'expert' | 'admin';
  profileImage?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  token: null,
  
  login: (user: User, token: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null, isAuthenticated: false });
  },
  
  updateUser: (updatedUser: Partial<User>) => {
    set((state) => {
      if (!state.user) return state;
      const newUser = { ...state.user, ...updatedUser };
      localStorage.setItem('user', JSON.stringify(newUser));
      return { user: newUser };
    });
  },
}));

// Initialize from localStorage
const token = localStorage.getItem('token');
const userStr = localStorage.getItem('user');
if (token && userStr) {
  try {
    const user = JSON.parse(userStr);
    useAuthStore.getState().login(user, token);
  } catch (error) {
    console.error('Failed to parse user from localStorage:', error);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}
