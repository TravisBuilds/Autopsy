import { normalizeSessionDate } from "@/lib/biomarkers/dates";
import { compareByPriority } from "@/lib/biomarkers/priority";
import { sortSessionsChronologically } from "@/lib/biomarkers/session-history";
import type { BiomarkerFlag, BiomarkerReading } from "@/types/health";
import type { SessionReading, TestSession } from "@/types/ingestion";

export interface TimelinePanel {
  session: TestSession;
  dateKey: string;
  /** 0–100 position on horizontal axis */
  positionPercent: number;
  abnormalCount: number;
  totalMarkers: number;
  hasAbnormal: boolean;
}

function dateToMs(dateKey: string): number {
  const [y, m, d] = normalizeSessionDate(dateKey).split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

function readingToBiomarkerStub(r: SessionReading): BiomarkerReading {
  return {
    id: r.markerId,
    markerName: r.markerName,
    category: r.category,
    value: r.value,
    unit: r.unit,
    referenceLow: r.referenceLow,
    referenceHigh: r.referenceHigh,
    flag: r.flag,
    date: "",
  };
}

export function buildTimelinePanels(sessions: TestSession[]): TimelinePanel[] {
  const sorted = sortSessionsChronologically(sessions).filter((s) => (s.readings?.length ?? 0) > 0);
  if (sorted.length === 0) return [];

  const ms = sorted.map((s) => dateToMs(s.date));
  const min = Math.min(...ms);
  const max = Math.max(...ms);
  const span = max - min || 1;

  return sorted.map((session) => {
    const dateKey = normalizeSessionDate(session.date);
    const readings = session.readings ?? [];
    const abnormal = readings.filter((r) => r.flag !== "normal");

    return {
      session,
      dateKey,
      positionPercent: ((dateToMs(dateKey) - min) / span) * 100,
      abnormalCount: abnormal.length,
      totalMarkers: readings.length,
      hasAbnormal: abnormal.length > 0,
    };
  });
}

export function getTimelineYearSpan(panels: TimelinePanel[]): { start: number; end: number } | null {
  if (panels.length === 0) return null;
  const years = panels.map((p) => parseInt(p.dateKey.slice(0, 4), 10));
  return { start: Math.min(...years), end: Math.max(...years) };
}

/** Out-of-range first by clinical priority, then in-range alphabetically */
export function sortPanelReadings(readings: SessionReading[], flaggedOnly: boolean): SessionReading[] {
  const abnormal = readings
    .filter((r) => r.flag !== "normal")
    .sort((a, b) =>
      compareByPriority(readingToBiomarkerStub(a), readingToBiomarkerStub(b))
    );
  const normal = readings
    .filter((r) => r.flag === "normal")
    .sort((a, b) => a.markerName.localeCompare(b.markerName));
  return flaggedOnly ? abnormal : [...abnormal, ...normal];
}

export function flagGlyph(flag: BiomarkerFlag): string {
  if (flag === "high" || flag === "critical") return "↑";
  if (flag === "low") return "↓";
  return "·";
}
