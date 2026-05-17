"use client";

import { useMemo } from "react";
import { mockBiomarkers, mockAlerts, mockTimeline } from "@/lib/mock-data";
import { useHealthStore } from "@/stores/health-store";
import type { BiomarkerReading, HealthAlert, TimelineEvent } from "@/types/health";

export function useBiomarkers(includeDemo = true): BiomarkerReading[] {
  const stored = useHealthStore((s) => s.getBiomarkerList());

  return useMemo(() => {
    if (stored.length === 0 && includeDemo) return mockBiomarkers;
    return stored;
  }, [stored, includeDemo]);
}

export function useAlerts(includeDemo = true): HealthAlert[] {
  const stored = useHealthStore((s) => s.getAlerts());
  const hasUploaded = useHealthStore((s) => s.testSessions.length > 0);

  return useMemo(() => {
    if (!hasUploaded && includeDemo) return mockAlerts;
    return stored;
  }, [stored, hasUploaded, includeDemo]);
}

export function useTimeline(includeDemo = true): TimelineEvent[] {
  const stored = useHealthStore((s) => s.timelineEvents);
  const hasUploaded = useHealthStore((s) => s.testSessions.length > 0);

  return useMemo(() => {
    if (!hasUploaded && includeDemo) return mockTimeline;
    return stored.length > 0 ? stored : includeDemo ? mockTimeline : [];
  }, [stored, hasUploaded, includeDemo]);
}

export function useHasUploadedData(): boolean {
  return useHealthStore((s) => s.testSessions.length > 0);
}

export function useTestSessions() {
  return useHealthStore((s) => s.testSessions);
}
