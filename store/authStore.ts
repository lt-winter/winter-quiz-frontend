import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface User {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "USER";
}

interface AuthState {
  user: User | null;
  hasHydrated: boolean;
  setUser: (user: User | null) => void;
  setHasHydrated: (value: boolean) => void;
  logout: () => void;
  isAdmin: () => boolean;
  isLoggedIn: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      hasHydrated: false,

      setUser: (user) => set({ user }),

      setHasHydrated: (value) => set({ hasHydrated: value }),

      logout: () => set({ user: null }),

      isAdmin: () => get().user?.role === "ADMIN",

      isLoggedIn: () => get().user !== null,
    }),
    {
      name: "quiz-auth-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
