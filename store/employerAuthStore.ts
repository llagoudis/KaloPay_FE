"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser } from "@/types/auth";

interface EmployerAuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: AuthUser, token: string) => void;
  clearAuth: () => void;
}

export const useEmployerAuthStore = create<EmployerAuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => {
        document.cookie = `employer-auth=${token}; path=/; max-age=${60 * 60 * 24 * 7}`;
        set({ user, token, isAuthenticated: true });
      },
      clearAuth: () => {
        document.cookie = "employer-auth=; path=/; max-age=0";
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    { name: "employer-auth-store" }
  )
);
