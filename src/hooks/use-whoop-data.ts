"use client";

import { useCallback, useEffect, useState } from "react";
import type { WhoopDashboardData } from "@/lib/whoop/types";
import { useAuthStore } from "@/stores/auth-store";

export function useWhoopData() {
  const whoopConnected = useAuthStore((s) => s.whoopConnected);
  const [data, setData] = useState<WhoopDashboardData | null>(null);
  const [loading, setLoading] = useState(() => useAuthStore.getState().whoopConnected);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!whoopConnected) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/whoop/data");
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      setData((await res.json()) as WhoopDashboardData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load WHOOP data");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [whoopConnected]);

  useEffect(() => {
    if (!whoopConnected) {
      setData(null);
      setLoading(false);
      return;
    }
    load();
  }, [whoopConnected, load]);

  return {
    whoopConnected,
    data,
    loading,
    error,
    reload: load,
  };
}
