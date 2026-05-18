"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { useAuthStore } from "@/stores/auth-store";

/** Sync Supabase auth + WHOOP session into client store. */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((s) => s.setUser);
  const setWhoopStatus = useAuthStore((s) => s.setWhoopStatus);
  const signOut = useAuthStore((s) => s.signOut);

  useEffect(() => {
    const syncFromApi = () =>
      fetch("/api/auth/session")
        .then((r) => r.json())
        .then(
          (data: {
            user: { id: string; displayName: string; email?: string } | null;
            whoop: { connected: boolean; expiresAt?: string };
          }) => {
            if (data.user) {
              setUser({
                id: data.user.id,
                displayName: data.user.displayName,
                email: data.user.email,
                createdAt: new Date().toISOString(),
              });
            } else {
              setUser(null);
            }
            setWhoopStatus(data.whoop?.connected ?? false, data.whoop?.expiresAt ?? null);
          }
        )
        .catch(() => {});

    syncFromApi();

    if (!isSupabaseConfigured()) return;

    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        signOut();
        syncFromApi();
        return;
      }
      syncFromApi();
    });

    return () => subscription.unsubscribe();
  }, [setUser, setWhoopStatus, signOut]);

  return <>{children}</>;
}
