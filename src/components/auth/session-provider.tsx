"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";

/** Sync server session (cookies) into client auth store on load */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((s) => s.setUser);
  const setWhoopStatus = useAuthStore((s) => s.setWhoopStatus);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data: { user: { id: string; displayName: string; email?: string } | null; whoop: { connected: boolean; expiresAt?: string } }) => {
        if (data.user) {
          setUser({
            id: data.user.id,
            displayName: data.user.displayName,
            email: data.user.email,
            createdAt: new Date().toISOString(),
          });
        }
        setWhoopStatus(data.whoop?.connected ?? false, data.whoop?.expiresAt ?? null);
      })
      .catch(() => {});
  }, [setUser, setWhoopStatus]);

  return <>{children}</>;
}
