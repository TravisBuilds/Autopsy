import { formatChartDate } from "@/lib/biomarkers/dates";
import { toChartSeriesFromSessions } from "@/lib/biomarkers/session-history";
import type { BiomarkerReading } from "@/types/health";
import type { TestSession } from "@/types/ingestion";

export interface ChartPoint {
  date: string;
  label: string;
  value: number;
  inRange: boolean;
}

export { formatChartDate };

export function toChartSeries(
  biomarker: BiomarkerReading,
  sessions?: TestSession[]
): ChartPoint[] {
  if (sessions && sessions.length > 0) {
    const fromSessions = toChartSeriesFromSessions(biomarker, sessions);
    if (fromSessions.length > 0) return fromSessions;
  }

  const points = [...(biomarker.history ?? [])];
  const dateKey = biomarker.date.length >= 10 ? biomarker.date : biomarker.date;

  if (!points.some((p) => p.date === dateKey)) {
    points.push({ date: dateKey, value: biomarker.value });
  }

  return [...points]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((p) => ({
      date: p.date,
      label: formatChartDate(p.date),
      value: p.value,
      inRange: p.value >= biomarker.referenceLow && p.value <= biomarker.referenceHigh,
    }));
}

export function chartYDomain(
  points: ChartPoint[],
  referenceLow: number,
  referenceHigh: number
): [number, number] {
  const values = points.map((p) => p.value);
  const minVal = Math.min(...values, referenceLow);
  const maxVal = Math.max(...values, referenceHigh);
  const padding = (maxVal - minVal) * 0.12 || 1;
  return [Math.max(0, minVal - padding), maxVal + padding];
}
