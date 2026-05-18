import { normalizeSessionDate } from "@/lib/biomarkers/dates";
import {
  buildTimelinePanels,
  type TimelinePanel,
} from "@/lib/biomarkers/timeline-panels";
import type { Intervention } from "@/types/health";
import type { TestSession } from "@/types/ingestion";

function dateToMs(dateKey: string): number {
  const [y, m, d] = normalizeSessionDate(dateKey).split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

export interface TimelineInterventionMarker {
  kind: "intervention";
  intervention: Intervention;
  dateKey: string;
  positionPercent: number;
}

export type TimelineAxisMarker =
  | { kind: "panel"; panel: TimelinePanel }
  | TimelineInterventionMarker;

export function buildTimelineAxisMarkers(
  sessions: TestSession[],
  interventions: Intervention[]
): TimelineAxisMarker[] {
  const panels = buildTimelinePanels(sessions);
  const dateKeys = [
    ...panels.map((p) => p.dateKey),
    ...interventions.map((i) => normalizeSessionDate(i.startDate)),
  ];

  if (dateKeys.length === 0) return [];

  const ms = dateKeys.map(dateToMs);
  const min = Math.min(...ms);
  const max = Math.max(...ms);
  const span = max - min || 1;

  const panelMarkers: TimelineAxisMarker[] = panels.map((panel) => ({
    kind: "panel",
    panel,
  }));

  const interventionMarkers: TimelineInterventionMarker[] = interventions.map((intervention) => {
    const dateKey = normalizeSessionDate(intervention.startDate);
    return {
      kind: "intervention",
      intervention,
      dateKey,
      positionPercent: ((dateToMs(dateKey) - min) / span) * 100,
    };
  });

  return [...panelMarkers, ...interventionMarkers].sort(
    (a, b) => dateToMs(getMarkerDateKey(a)) - dateToMs(getMarkerDateKey(b))
  );
}

export function getMarkerDateKey(marker: TimelineAxisMarker): string {
  return marker.kind === "panel" ? marker.panel.dateKey : marker.dateKey;
}

export function getMarkerId(marker: TimelineAxisMarker): string {
  return marker.kind === "panel" ? marker.panel.session.id : marker.intervention.id;
}

export function getTimelineYearSpanFromMarkers(
  markers: TimelineAxisMarker[]
): { start: number; end: number } | null {
  if (markers.length === 0) return null;
  const years = markers.map((m) => parseInt(getMarkerDateKey(m).slice(0, 4), 10));
  return { start: Math.min(...years), end: Math.max(...years) };
}
