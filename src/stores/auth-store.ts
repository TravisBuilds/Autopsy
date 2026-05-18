"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AuthUser {
  id: string;
  displayName: string;
  email?: string;
  createdAt: string;
}

interface AuthState {
  user: AuthUser | null;
  whoopConnected: boolean;
  whoopExpiresAt: string | null;

  setUser: (user: AuthUser | null) => void;
  setWhoopStatus: (connected: boolean, expiresAt?: string | null) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      whoopConnected: false,
      whoopExpiresAt: null,

      setUser: (user) => set({ user }),
      setWhoopStatus: (whoopConnected, whoopExpiresAt = null) =>
        set({ whoopConnected, whoopExpiresAt: whoopExpiresAt ?? null }),
      signOut: () =>
        set({ user: null, whoopConnected: false, whoopExpiresAt: null }),
    }),
    { name: "autopsy-auth" }
  )
);
