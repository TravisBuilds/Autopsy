"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { formatTimelineDate, normalizeSessionDate } from "@/lib/biomarkers/dates";
import {
  formatInterventionTimelineLabel,
  type InterventionInput,
} from "@/lib/interventions/format";
import { slugifyMarker } from "@/lib/ingestion/marker-catalog";
import type { BiomarkerReading, Intervention, TimelineEvent } from "@/types/health";
import type { ParsedBiomarker, SessionReading, TestSession } from "@/types/ingestion";

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
  interventions: Intervention[];

  confirmSession: (input: ConfirmSessionInput) => void;
  addIntervention: (input: InterventionInput) => string;
  updateIntervention: (id: string, input: InterventionInput) => void;
  removeIntervention: (id: string) => void;
  clearAllData: () => void;
  rebuildFromSessions: () => void;
}

function toSessionReadings(parsed: ParsedBiomarker[]): SessionReading[] {
  return parsed.map((row) => ({
    markerId: slugifyMarker(row.markerName),
    markerName: row.markerName,
    category: row.category,
    value: row.value,
    unit: row.unit,
    referenceLow: row.referenceLow,
    referenceHigh: row.referenceHigh,
    flag: row.flag,
  }));
}

function rebuildBiomarkersFromSessions(sessions: TestSession[]): Record<string, BiomarkerReading> {
  const sorted = [...sessions].sort(
    (a, b) =>
      normalizeSessionDate(a.date).localeCompare(normalizeSessionDate(b.date)) ||
      a.createdAt.localeCompare(b.createdAt)
  );

  const result: Record<string, BiomarkerReading> = {};

  for (const session of sorted) {
    for (const row of session.readings ?? []) {
      const dateKey = normalizeSessionDate(session.date);
      const existing = result[row.markerId];
      const history = [...(existing?.history ?? [])];

      const existingIdx = history.findIndex((h) => h.date === dateKey);
      if (existingIdx >= 0) {
        history[existingIdx] = { date: dateKey, value: row.value };
      } else {
        history.push({ date: dateKey, value: row.value });
      }
      history.sort((a, b) => a.date.localeCompare(b.date));

      const prior = history.length >= 2 ? history[history.length - 2] : undefined;
      const changePercent =
        prior && prior.value !== 0
          ? Math.round(((row.value - prior.value) / prior.value) * 100)
          : undefined;

      result[row.markerId] = {
        id: row.markerId,
        markerName: row.markerName,
        category: row.category,
        value: row.value,
        unit: row.unit,
        referenceLow: row.referenceLow,
        referenceHigh: row.referenceHigh,
        flag: row.flag,
        date: dateKey,
        history,
        changePercent,
      };
    }
  }

  return result;
}

function labTimelineEvents(sessions: TestSession[]): TimelineEvent[] {
  const sorted = [...sessions].sort(
    (a, b) =>
      normalizeSessionDate(b.date).localeCompare(normalizeSessionDate(a.date)) ||
      b.createdAt.localeCompare(a.createdAt)
  );

  const perDateCount = new Map<string, number>();

  return sorted.map((session) => {
    const dateKey = normalizeSessionDate(session.date);
    const n = (perDateCount.get(dateKey) ?? 0) + 1;
    perDateCount.set(dateKey, n);

    const readings = session.readings ?? [];
    const abnormal = readings.filter((b) => b.flag !== "normal");
    const markers =
      abnormal.length > 0
        ? abnormal.map((b) => `${b.flag === "high" ? "↑" : "↓"} ${b.markerName}`)
        : readings.slice(0, 4).map((b) => b.markerName);

    const sameDateTotal = sessions.filter((s) => normalizeSessionDate(s.date) === dateKey).length;
    const dateLabel = formatTimelineDate(dateKey);
    const suffix =
      sameDateTotal > 1
        ? ` · panel ${n}`
        : session.sourceFileName
          ? ` · ${session.sourceFileName.replace(/\.pdf$/i, "")}`
          : "";

    return {
      id: `timeline-${session.id}`,
      date: dateKey,
      label: `Lab panel · ${session.labName ?? "Bloodwork"} · ${dateLabel}${suffix}`,
      type: "biomarker" as const,
      direction: abnormal.some((b) => b.flag === "high")
        ? ("up" as const)
        : abnormal.some((b) => b.flag === "low")
          ? ("down" as const)
          : ("neutral" as const),
      markers,
    };
  });
}

function interventionTimelineEvents(interventions: Intervention[]): TimelineEvent[] {
  return interventions.map((i) => ({
    id: `intervention-${i.id}`,
    date: normalizeSessionDate(i.startDate),
    label: formatInterventionTimelineLabel(i),
    type: "intervention" as const,
    direction: "neutral" as const,
    markers: [i.dosage, i.frequency].filter(Boolean) as string[],
  }));
}

function rebuildTimeline(
  sessions: TestSession[],
  interventions: Intervention[]
): TimelineEvent[] {
  return [...labTimelineEvents(sessions), ...interventionTimelineEvents(interventions)].sort(
    (a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)
  );
}

function syncDerived(state: {
  testSessions: TestSession[];
  interventions: Intervention[];
}) {
  return {
    biomarkers: rebuildBiomarkersFromSessions(state.testSessions),
    timelineEvents: rebuildTimeline(state.testSessions, state.interventions),
  };
}

type PersistedHealth = {
  biomarkers?: Record<string, BiomarkerReading>;
  testSessions?: TestSession[];
  timelineEvents?: TimelineEvent[];
  interventions?: Intervention[];
};

export const useHealthStore = create<HealthState>()(
  persist(
    (set, get) => ({
      biomarkers: {},
      testSessions: [],
      timelineEvents: [],
      interventions: [],

      confirmSession: ({ biomarkers: parsed, sessionDate, labName, sourceFileName }) => {
        const sessionId = crypto.randomUUID();
        const normalizedDate = normalizeSessionDate(sessionDate);

        const session: TestSession = {
          id: sessionId,
          date: normalizedDate,
          labName,
          sourceFileName,
          biomarkerCount: parsed.length,
          createdAt: new Date().toISOString(),
          readings: toSessionReadings(parsed),
        };

        set((state) => {
          const testSessions = [session, ...state.testSessions];
          return { testSessions, ...syncDerived({ testSessions, interventions: state.interventions }) };
        });
      },

      addIntervention: (input) => {
        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        const intervention: Intervention = {
          ...input,
          id,
          startDate: normalizeSessionDate(input.startDate),
          endDate: input.endDate ? normalizeSessionDate(input.endDate) : undefined,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => {
          const interventions = [...state.interventions, intervention].sort((a, b) =>
            normalizeSessionDate(b.startDate).localeCompare(normalizeSessionDate(a.startDate))
          );
          return { interventions, ...syncDerived({ testSessions: state.testSessions, interventions }) };
        });

        return id;
      },

      updateIntervention: (id, input) => {
        set((state) => {
          const interventions = state.interventions
            .map((i) =>
              i.id === id
                ? {
                    ...i,
                    ...input,
                    startDate: normalizeSessionDate(input.startDate),
                    endDate: input.endDate ? normalizeSessionDate(input.endDate) : undefined,
                    updatedAt: new Date().toISOString(),
                  }
                : i
            )
            .sort((a, b) =>
              normalizeSessionDate(b.startDate).localeCompare(normalizeSessionDate(a.startDate))
            );
          return { interventions, ...syncDerived({ testSessions: state.testSessions, interventions }) };
        });
      },

      removeIntervention: (id) => {
        set((state) => {
          const interventions = state.interventions.filter((i) => i.id !== id);
          return { interventions, ...syncDerived({ testSessions: state.testSessions, interventions }) };
        });
      },

      rebuildFromSessions: () => {
        const { testSessions, interventions } = get();
        set(syncDerived({ testSessions, interventions }));
      },

      clearAllData: () =>
        set({ biomarkers: {}, testSessions: [], timelineEvents: [], interventions: [] }),
    }),
    {
      name: "autopsy-health",
      version: 3,
      partialize: (s) => ({
        biomarkers: s.biomarkers,
        testSessions: s.testSessions,
        timelineEvents: s.timelineEvents,
        interventions: s.interventions,
      }),
      migrate: (persistedState, version) => {
        const persisted = persistedState as PersistedHealth;
        const sessions = (persisted.testSessions ?? []).map((s) => ({
          ...s,
          readings: s.readings ?? [],
          date: normalizeSessionDate(s.date),
        }));
        const interventions = (persisted.interventions ?? []).map((i) => ({
          ...i,
          startDate: normalizeSessionDate(i.startDate),
          endDate: i.endDate ? normalizeSessionDate(i.endDate) : undefined,
          createdAt: i.createdAt ?? new Date().toISOString(),
          updatedAt: i.updatedAt ?? new Date().toISOString(),
        }));

        if (version < 2) {
          const withReadings = sessions.filter((s) => s.readings.length > 0);
          if (withReadings.length > 0) {
            return {
              biomarkers: rebuildBiomarkersFromSessions(withReadings),
              testSessions: sessions,
              interventions,
              timelineEvents: rebuildTimeline(withReadings, interventions),
            };
          }
        }

        if (version < 3) {
          return {
            biomarkers: persisted.biomarkers ?? rebuildBiomarkersFromSessions(sessions),
            testSessions: sessions,
            interventions,
            timelineEvents: rebuildTimeline(sessions, interventions),
          };
        }

        return {
          biomarkers: persisted.biomarkers ?? {},
          testSessions: sessions,
          interventions,
          timelineEvents: persisted.timelineEvents ?? rebuildTimeline(sessions, interventions),
        };
      },
    }
  )
);

export function hasLegacySessionsWithoutReadings(sessions: TestSession[]): boolean {
  return sessions.some((s) => !s.readings?.length);
}
