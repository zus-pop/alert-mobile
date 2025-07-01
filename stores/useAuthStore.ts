// stores/useAuthStore.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  image?: string;
  studentCode: string;
  deletedAt: string | null;
  isDeleted: boolean;
  updatedAt: string;
  deviceTokens?: string[];
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  setAccessToken: (t: string) => void;
  setRefreshToken: (t: string) => void;
  setUser: (u: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      setAccessToken: (t) => set({ accessToken: t }),
      setRefreshToken: (t) => set({ refreshToken: t }),
      setUser: (u) => set({ user: u }),
      logout: () => set({ accessToken: null, refreshToken: null, user: null }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      // Optionally use secure store instead
      // storage: createJSONStorage(() => SecureStore),
    }
  )
);
