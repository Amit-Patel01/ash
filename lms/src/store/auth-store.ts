import { create } from "zustand";
import type { AuthUser } from "@/types";

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  setSession: (user: AuthUser, accessToken: string) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => {
  const isClient = typeof window !== "undefined";
  
  // Safe initial values for SSR
  let initialUser: AuthUser | null = null;
  let initialToken: string | null = null;

  if (isClient) {
    try {
      const stored = localStorage.getItem("ash_user");
      initialUser = stored ? JSON.parse(stored) : null;
      initialToken = localStorage.getItem("ash_token");
    } catch (e) {
      console.error("Failed to parse auth from localStorage", e);
    }
  }

  return {
    user: initialUser,
    accessToken: initialToken,
    setSession: (user, accessToken) => {
      if (isClient) {
        localStorage.setItem("ash_user", JSON.stringify(user));
        localStorage.setItem("ash_token", accessToken);
      }
      set({ user, accessToken });
    },
    logout: () => {
      if (isClient) {
        localStorage.removeItem("ash_user");
        localStorage.removeItem("ash_token");
      }
      set({ user: null, accessToken: null });
    }
  };
});
