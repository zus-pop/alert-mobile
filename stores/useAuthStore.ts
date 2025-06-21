// stores/useAuthStore.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: any;
  setAccessToken: (t: string) => void;
  setRefreshToken: (t: string) => void;
  setUser: (u: any) => void;
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
      logout: () => set({ accessToken: null, user: null }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      // Optionally use secure store instead
      // storage: createJSONStorage(() => SecureStore),
    }
  )
);
