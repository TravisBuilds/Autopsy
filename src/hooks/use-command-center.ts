"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { analyzeCommandCenter } from "@/lib/command-center/analyze";
import { fetchGenomeProfile } from "@/lib/genome/api-client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { useHealthStore } from "@/stores/health-store";
import { selectBiomarkerList } from "@/stores/selectors";
import { useAuthStore } from "@/stores/auth-store";
import { useWhoopData } from "@/hooks/use-whoop-data";
import type { CommandCenterAnalysis } from "@/types/command-center";
import type { GenomeProfile } from "@/types/genome";

export function useCommandCenterAnalysis(): {
  analysis: CommandCenterAnalysis | null;
  loading: boolean;
  genomeLoading: boolean;
  error: string | null;
  reload: () => Promise<void>;
} {
  const user = useAuthStore((s) => s.user);
  const biomarkers = useHealthStore((s) => s.biomarkers);
  const interventions = useHealthStore((s) => s.interventions);
  const { data: whoopData, loading: whoopLoading } = useWhoopData();

  const [genomeProfile, setGenomeProfile] = useState<GenomeProfile | null>(null);
  const [genomeLoading, setGenomeLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cloudEnabled = isSupabaseConfigured() && Boolean(user);

  const loadGenome = useCallback(async () => {
    if (!cloudEnabled) {
      setGenomeProfile(null);
      return;
    }

    setGenomeLoading(true);
    setError(null);
    try {
      const profile = await fetchGenomeProfile();
      setGenomeProfile(profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load genome profile");
      setGenomeProfile(null);
    } finally {
      setGenomeLoading(false);
    }
  }, [cloudEnabled]);

  useEffect(() => {
    void loadGenome();
  }, [loadGenome]);

  const analysis = useMemo(() => {
    const biomarkerList = selectBiomarkerList(biomarkers);
    if (!cloudEnabled && biomarkerList.length === 0 && !whoopData?.latest) {
      return null;
    }

    return analyzeCommandCenter({
      variants: genomeProfile?.variants ?? [],
      biomarkers: biomarkerList,
      wearable: whoopData?.latest ?? null,
      interventions,
    });
  }, [biomarkers, cloudEnabled, genomeProfile, interventions, whoopData?.latest]);

  return {
    analysis,
    loading: genomeLoading || whoopLoading,
    genomeLoading,
    error,
    reload: loadGenome,
  };
}
