"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser } from "@/types/auth";

interface EmployeeAuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: AuthUser, token: string) => void;
  clearAuth: () => void;
}

export const useEmployeeAuthStore = create<EmployeeAuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => {
        // Set cookie for middleware to read
        document.cookie = `employee-auth=${token}; path=/; max-age=${60 * 60 * 24 * 7}`;
        set({ user, token, isAuthenticated: true });
      },
      clearAuth: () => {
        document.cookie = "employee-auth=; path=/; max-age=0";
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    { name: "employee-auth-store" }
  )
);
