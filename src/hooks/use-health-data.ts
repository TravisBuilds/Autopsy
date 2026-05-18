"use client";

import { useMemo } from "react";
import { useHealthStore } from "@/stores/health-store";
import {
  selectAlerts,
  selectBiomarkerList,
  selectPriorityBiomarkerList,
} from "@/stores/selectors";
import type { BiomarkerReading, HealthAlert, TimelineEvent } from "@/types/health";

export function useBiomarkers(): BiomarkerReading[] {
  const biomarkers = useHealthStore((s) => s.biomarkers);
  return useMemo(() => selectBiomarkerList(biomarkers), [biomarkers]);
}

export function usePriorityBiomarkers(limit = 3): BiomarkerReading[] {
  const biomarkers = useHealthStore((s) => s.biomarkers);
  return useMemo(() => selectPriorityBiomarkerList(biomarkers, limit), [biomarkers, limit]);
}

export function useAlerts(): HealthAlert[] {
  const biomarkers = useHealthStore((s) => s.biomarkers);
  const hasUploaded = useHealthStore((s) => s.testSessions.length > 0);
  return useMemo(() => {
    if (!hasUploaded) return [];
    return selectAlerts(biomarkers);
  }, [biomarkers, hasUploaded]);
}

export function useTimeline(): TimelineEvent[] {
  const timelineEvents = useHealthStore((s) => s.timelineEvents);
  return useMemo(() => timelineEvents, [timelineEvents]);
}

export function useHasUploadedData(): boolean {
  return useHealthStore((s) => s.testSessions.length > 0);
}

export function useTestSessions() {
  return useHealthStore((s) => s.testSessions);
}

export function useInterventions() {
  return useHealthStore((s) => s.interventions);
}
