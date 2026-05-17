"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { slugifyMarker } from "@/lib/ingestion/marker-catalog";
import type { BiomarkerReading, HealthAlert, TimelineEvent } from "@/types/health";
import type { ParsedBiomarker, TestSession } from "@/types/ingestion";

interface ConfirmSessionInput {
  biomarkers: ParsedBiomarker[];
  sessionDate: string;
  labName?: string;
  sourceFileName?: string;
}

interface HealthState {
  biomarkers: Record<string, BiomarkerReading>;
  testSessions: TestSession[];
  timelineEvents: TimelineEvent[];

  confirmSession: (input: ConfirmSessionInput) => void;
  clearAllData: () => void;
  getBiomarkerList: () => BiomarkerReading[];
  getAlerts: () => HealthAlert[];
}

function formatHistoryDate(isoDate: string): string {
  return isoDate.slice(0, 7);
}

function mergeReading(
  existing: BiomarkerReading | undefined,
  parsed: ParsedBiomarker,
  sessionDate: string
): BiomarkerReading {
  const id = slugifyMarker(parsed.markerName);
  const history = [...(existing?.history ?? [])];

  if (existing && !history.some((h) => h.date === formatHistoryDate(existing.date))) {
    history.push({ date: formatHistoryDate(existing.date), value: existing.value });
  }

  const monthKey = formatHistoryDate(sessionDate);
  const withoutDup = history.filter((h) => h.date !== monthKey);
  withoutDup.push({ date: monthKey, value: parsed.value });
  withoutDup.sort((a, b) => a.date.localeCompare(b.date));

  const prior = withoutDup.length >= 2 ? withoutDup[withoutDup.length - 2] : undefined;
  const changePercent =
    prior && prior.value !== 0
      ? Math.round(((parsed.value - prior.value) / prior.value) * 100)
      : existing?.changePercent;

  return {
    id,
    markerName: parsed.markerName,
    category: parsed.category,
    value: parsed.value,
    unit: parsed.unit,
    referenceLow: parsed.referenceLow,
    referenceHigh: parsed.referenceHigh,
    flag: parsed.flag,
    date: sessionDate,
    history: withoutDup,
    changePercent,
  };
}

function buildAlerts(biomarkers: BiomarkerReading[]): HealthAlert[] {
  return biomarkers
    .filter((b) => b.flag === "high" || b.flag === "low" || b.flag === "critical")
    .map((b) => ({
      id: `alert-${b.id}`,
      title: `${b.markerName} ${b.flag}`,
      description: `${b.value} ${b.unit} — reference ${b.referenceLow}–${b.referenceHigh}`,
      severity: b.flag === "critical" ? "critical" : "warning",
      category: b.category,
      timestamp: b.date,
    }));
}

function buildTimelineEvent(
  session: TestSession,
  biomarkers: ParsedBiomarker[]
): TimelineEvent {
  const abnormal = biomarkers.filter((b) => b.flag !== "normal");
  const markers =
    abnormal.length > 0
      ? abnormal.map((b) => `${b.flag === "high" ? "↑" : "↓"} ${b.markerName}`)
      : biomarkers.slice(0, 4).map((b) => b.markerName);

  return {
    id: `timeline-${session.id}`,
    date: formatHistoryDate(session.date),
    label: `Lab panel · ${session.labName ?? "Bloodwork"}`,
    type: "biomarker",
    direction: abnormal.some((b) => b.flag === "high") ? "up" : "neutral",
    markers,
  };
}

export const useHealthStore = create<HealthState>()(
  persist(
    (set, get) => ({
      biomarkers: {},
      testSessions: [],
      timelineEvents: [],

      confirmSession: ({ biomarkers: parsed, sessionDate, labName, sourceFileName }) => {
        const sessionId = crypto.randomUUID();
        const session: TestSession = {
          id: sessionId,
          date: sessionDate,
          labName,
          sourceFileName,
          biomarkerCount: parsed.length,
          createdAt: new Date().toISOString(),
        };

        set((state) => {
          const nextBiomarkers = { ...state.biomarkers };
          for (const row of parsed) {
            const id = slugifyMarker(row.markerName);
            nextBiomarkers[id] = mergeReading(state.biomarkers[id], row, sessionDate);
          }

          const timelineEvents = [
            buildTimelineEvent(session, parsed),
            ...state.timelineEvents.filter((e) => e.id !== `timeline-${sessionId}`),
          ];

          return {
            biomarkers: nextBiomarkers,
            testSessions: [session, ...state.testSessions],
            timelineEvents,
          };
        });
      },

      clearAllData: () =>
        set({ biomarkers: {}, testSessions: [], timelineEvents: [] }),

      getBiomarkerList: () => {
        const list = Object.values(get().biomarkers);
        return list.sort((a, b) => {
          const order = { high: 0, critical: 0, low: 1, normal: 2 };
          return (order[a.flag] ?? 3) - (order[b.flag] ?? 3);
        });
      },

      getAlerts: () => buildAlerts(get().getBiomarkerList()),
    }),
    {
      name: "autopsy-health",
      partialize: (s) => ({
        biomarkers: s.biomarkers,
        testSessions: s.testSessions,
        timelineEvents: s.timelineEvents,
      }),
    }
  )
);
