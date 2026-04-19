"use client";

import { create } from "zustand";
import type { UserResponse } from "@/types/auth";

interface AuthState {
  accessToken: string | null;
  user: UserResponse | null;
  setAuth: (token: string, user: UserResponse) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  setAuth: (token, user) => {
    document.cookie = `access-token=${encodeURIComponent(token)}; path=/; max-age=900; SameSite=Strict`;
    set({ accessToken: token, user });
  },
  clearAuth: () => {
    document.cookie = "access-token=; path=/; max-age=0";
    localStorage.removeItem("refresh-token");
    set({ accessToken: null, user: null });
  },
}));
