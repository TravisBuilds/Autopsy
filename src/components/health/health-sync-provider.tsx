"use client";

import { useEffect, useRef } from "react";
import {
  fetchHealthSync,
  pushLocalHealthData,
} from "@/lib/health/api-client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { useAuthStore } from "@/stores/auth-store";
import { useHealthStore } from "@/stores/health-store";

/** Load cloud health data when signed in; migrate local data per table if cloud is empty. */
export function HealthSyncProvider({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const hydrateFromCloud = useHealthStore((s) => s.hydrateFromCloud);
  const syncedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured() || !user) {
      syncedRef.current = null;
      return;
    }

    if (syncedRef.current === user.id) return;

    let cancelled = false;

    (async () => {
      try {
        const localSessions = useHealthStore.getState().testSessions;
        const localInterventions = useHealthStore.getState().interventions;

        let cloud = await fetchHealthSync();
        if (cancelled) return;

        const needSessionMigrate =
          cloud.testSessions.length === 0 && localSessions.length > 0;
        const needInterventionMigrate =
          cloud.interventions.length === 0 && localInterventions.length > 0;

        if (needSessionMigrate || needInterventionMigrate) {
          await pushLocalHealthData({
            testSessions: needSessionMigrate ? localSessions : [],
            interventions: needInterventionMigrate ? localInterventions : [],
          });
          if (cancelled) return;
          cloud = await fetchHealthSync();
          if (cancelled) return;
        }

        hydrateFromCloud(cloud);
        syncedRef.current = user.id;
      } catch {
        syncedRef.current = null;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, hydrateFromCloud]);

  return <>{children}</>;
}
