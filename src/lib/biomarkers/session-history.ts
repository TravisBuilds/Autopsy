import { formatChartDate, formatTimelineDate, normalizeSessionDate } from "@/lib/biomarkers/dates";
import type { ChartPoint } from "@/lib/biomarkers/chart-data";
import type { BiomarkerReading } from "@/types/health";
import type { SessionReading, TestSession } from "@/types/ingestion";

export interface MarkerHistoryRow extends ChartPoint {
  sessionId: string;
  sourceFileName?: string;
  labName?: string;
}

export function sortSessionsChronologically(sessions: TestSession[]): TestSession[] {
  return [...sessions].sort(
    (a, b) =>
      normalizeSessionDate(a.date).localeCompare(normalizeSessionDate(b.date)) ||
      a.createdAt.localeCompare(b.createdAt)
  );
}

/** Full marker history from every uploaded panel (source of truth). */
export function getMarkerHistoryFromSessions(
  markerId: string,
  sessions: TestSession[],
  reference: { low: number; high: number }
): MarkerHistoryRow[] {
  const rows: MarkerHistoryRow[] = [];

  for (const session of sortSessionsChronologically(sessions)) {
    const reading = session.readings?.find((r) => r.markerId === markerId);
    if (!reading) continue;

    const dateKey = normalizeSessionDate(session.date);
    rows.push({
      sessionId: session.id,
      date: dateKey,
      label: formatChartDate(dateKey),
      value: reading.value,
      inRange:
        reading.value >= reference.low && reading.value <= reference.high,
      sourceFileName: session.sourceFileName,
      labName: session.labName,
    });
  }

  return rows;
}

export function getMarkerPanelCount(markerId: string, sessions: TestSession[]): number {
  return sessions.filter((s) => s.readings?.some((r) => r.markerId === markerId)).length;
}

export function toChartSeriesFromSessions(
  biomarker: BiomarkerReading,
  sessions: TestSession[]
): ChartPoint[] {
  if (sessions.length === 0) return [];

  const fromSessions = getMarkerHistoryFromSessions(biomarker.id, sessions, {
    low: biomarker.referenceLow,
    high: biomarker.referenceHigh,
  });

  if (fromSessions.length > 0) return fromSessions;

  return biomarker.history?.map((h) => ({
    date: h.date,
    label: formatChartDate(h.date),
    value: h.value,
    inRange: h.value >= biomarker.referenceLow && h.value <= biomarker.referenceHigh,
  })) ?? [];
}

export function formatPanelTitle(session: TestSession, index?: number): string {
  const date = formatTimelineDate(normalizeSessionDate(session.date));
  const lab = session.labName ?? "Lab panel";
  const file = session.sourceFileName?.replace(/\.pdf$/i, "");
  const parts = [date, lab];
  if (file) parts.push(file);
  if (index !== undefined) return parts.join(" · ");
  return parts.join(" · ");
}

/** Stable key for spotting re-uploaded or migrated duplicate panels. */
export function sessionFingerprint(session: TestSession): string {
  const date = normalizeSessionDate(session.date);
  const file = (session.sourceFileName ?? "").trim().toLowerCase();
  const count = session.readings?.length ?? session.biomarkerCount ?? 0;
  return `${date}|${file}|${count}`;
}

export function duplicateSessionIds(sessions: TestSession[]): Set<string> {
  const groups = new Map<string, TestSession[]>();

  for (const session of sessions) {
    const key = sessionFingerprint(session);
    const list = groups.get(key) ?? [];
    list.push(session);
    groups.set(key, list);
  }

  const duplicateIds = new Set<string>();
  for (const group of groups.values()) {
    if (group.length < 2) continue;
    const sorted = [...group].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    for (const session of sorted.slice(1)) {
      duplicateIds.add(session.id);
    }
  }

  return duplicateIds;
}

export function dedupeSessionReadings(readings: SessionReading[]): SessionReading[] {
  const byId = new Map<string, SessionReading>();
  for (const reading of readings) {
    byId.set(reading.markerId, reading);
  }
  return [...byId.values()].sort((a, b) => a.markerName.localeCompare(b.markerName));
}

