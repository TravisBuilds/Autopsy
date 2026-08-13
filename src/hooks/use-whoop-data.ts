"use client";

import { useCallback, useEffect, useState } from "react";
import type { WhoopDashboardData } from "@/lib/whoop/types";
import { useAuthStore } from "@/stores/auth-store";

export function useWhoopData() {
  const user = useAuthStore((s) => s.user);
  const whoopConnected = useAuthStore((s) => s.whoopConnected);
  const [data, setData] = useState<WhoopDashboardData | null>(null);
  const [loading, setLoading] = useState(() => Boolean(useAuthStore.getState().user));
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (opts?: { sync?: boolean }) => {
      if (!user) {
        setData(null);
        setError(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const res = await fetch(opts?.sync ? "/api/whoop/data?sync=1" : "/api/whoop/data");
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(body.error ?? `HTTP ${res.status}`);
        }
        setData((await res.json()) as WhoopDashboardData);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load WHOOP data");
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  useEffect(() => {
    if (!user) {
      setData(null);
      setLoading(false);
      return;
    }
    void load();
  }, [user, whoopConnected, load]);

  return {
    whoopConnected: whoopConnected || Boolean(data?.connected),
    data,
    loading,
    error,
    reload: () => load({ sync: true }),
  };
}
