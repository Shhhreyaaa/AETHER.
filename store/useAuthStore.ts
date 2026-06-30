import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  isLoggedIn: boolean;
  user: { name: string; email: string } | null;
  login: (email: string, name?: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      user: null,

      login: (email, name = "User") => {
        set({
          isLoggedIn: true,
          user: { email, name },
        });
      },

      logout: () => {
        set({ isLoggedIn: false, user: null });
      },
    }),
    {
      name: 'aether-auth',
    }
  )
);
