// stores/useAuthStore.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface AuthState {
  token: string | null;
  user: any;
  setToken: (t: string) => void;
  setUser: (u: any) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setToken: (t) => set({ token: t }),
      setUser: (u) => set({ user: u }),
      logout: () => set({ token: null, user: null }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      // Optionally use secure store instead
      // storage: createJSONStorage(() => SecureStore),
    }
  )
);
