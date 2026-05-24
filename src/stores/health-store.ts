"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { formatTimelineDate, normalizeSessionDate } from "@/lib/biomarkers/dates";
import {
  formatInterventionTimelineLabel,
  type InterventionInput,
} from "@/lib/interventions/format";
import {
  createInterventionApi,
  deleteInterventionApi,
  deleteTestSessionApi,
  updateInterventionApi,
} from "@/lib/health/api-client";
import { toSessionReadings } from "@/lib/health/readings";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { useAuthStore } from "@/stores/auth-store";
import type { BiomarkerReading, Intervention, TimelineEvent } from "@/types/health";
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
  interventions: Intervention[];
  cloudSynced: boolean;

  confirmSession: (input: ConfirmSessionInput) => void;
  upsertTestSession: (session: TestSession) => void;
  hydrateFromCloud: (payload: {
    testSessions: TestSession[];
    interventions: Intervention[];
  }) => void;
  addIntervention: (input: InterventionInput) => string;
  applyIntervention: (intervention: Intervention) => void;
  updateIntervention: (id: string, input: InterventionInput) => void;
  replaceIntervention: (intervention: Intervention) => void;
  removeIntervention: (id: string) => void;
  removeTestSession: (id: string) => void;
  /** Saves to Supabase when signed in, then updates local state. */
  persistAddIntervention: (input: InterventionInput) => Promise<string>;
  persistUpdateIntervention: (id: string, input: InterventionInput) => Promise<void>;
  persistRemoveIntervention: (id: string) => Promise<void>;
  persistRemoveTestSession: (id: string) => Promise<void>;
  clearAllData: () => void;
  rebuildFromSessions: () => void;
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

function shouldPersistInterventionsToCloud() {
  return isSupabaseConfigured() && Boolean(useAuthStore.getState().user);
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
      cloudSynced: false,

      hydrateFromCloud: ({ testSessions, interventions }) => {
        set({
          testSessions,
          interventions,
          cloudSynced: true,
          ...syncDerived({ testSessions, interventions }),
        });
      },

      upsertTestSession: (session) => {
        set((state) => {
          const testSessions = [
            session,
            ...state.testSessions.filter((s) => s.id !== session.id),
          ];
          return { testSessions, cloudSynced: true, ...syncDerived({ testSessions, interventions: state.interventions }) };
        });
      },

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

      applyIntervention: (intervention) => {
        set((state) => {
          const interventions = [
            intervention,
            ...state.interventions.filter((i) => i.id !== intervention.id),
          ].sort((a, b) =>
            normalizeSessionDate(b.startDate).localeCompare(normalizeSessionDate(a.startDate))
          );
          return { interventions, ...syncDerived({ testSessions: state.testSessions, interventions }) };
        });
      },

      replaceIntervention: (intervention) => {
        set((state) => {
          const interventions = state.interventions
            .map((i) => (i.id === intervention.id ? intervention : i))
            .sort((a, b) =>
              normalizeSessionDate(b.startDate).localeCompare(normalizeSessionDate(a.startDate))
            );
          return { interventions, ...syncDerived({ testSessions: state.testSessions, interventions }) };
        });
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

      removeTestSession: (id) => {
        set((state) => {
          const testSessions = state.testSessions.filter((s) => s.id !== id);
          return { testSessions, ...syncDerived({ testSessions, interventions: state.interventions }) };
        });
      },

      persistAddIntervention: async (input) => {
        if (shouldPersistInterventionsToCloud()) {
          const created = await createInterventionApi(input);
          get().applyIntervention(created);
          return created.id;
        }
        return get().addIntervention(input);
      },

      persistUpdateIntervention: async (id, input) => {
        if (shouldPersistInterventionsToCloud()) {
          const updated = await updateInterventionApi(id, input);
          get().replaceIntervention(updated);
          return;
        }
        get().updateIntervention(id, input);
      },

      persistRemoveIntervention: async (id) => {
        if (shouldPersistInterventionsToCloud()) {
          await deleteInterventionApi(id);
        }
        get().removeIntervention(id);
      },

      persistRemoveTestSession: async (id) => {
        if (shouldPersistInterventionsToCloud()) {
          await deleteTestSessionApi(id);
        }
        get().removeTestSession(id);
      },

      rebuildFromSessions: () => {
        const { testSessions, interventions } = get();
        set(syncDerived({ testSessions, interventions }));
      },

      clearAllData: () =>
        set({
          biomarkers: {},
          testSessions: [],
          timelineEvents: [],
          interventions: [],
          cloudSynced: false,
        }),
    }),
    {
      name: "autopsy-health",
      version: 4,
      partialize: (s) => ({
        testSessions: s.testSessions,
        interventions: s.interventions,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const { testSessions, interventions } = state;
        Object.assign(state, syncDerived({ testSessions, interventions }));
      },
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
              testSessions: sessions,
              interventions,
              ...syncDerived({ testSessions: sessions, interventions }),
            };
          }
        }

        if (version < 4) {
          return {
            testSessions: sessions,
            interventions,
            ...syncDerived({ testSessions: sessions, interventions }),
          };
        }

        return {
          testSessions: sessions,
          interventions,
          ...syncDerived({ testSessions: sessions, interventions }),
        };
      },
    }
  )
);

export function hasLegacySessionsWithoutReadings(sessions: TestSession[]): boolean {
  return sessions.some((s) => !s.readings?.length);
}
