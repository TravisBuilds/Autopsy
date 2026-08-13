import type { WearableSnapshot } from "@/types/health";

export function recoveryTone(score: number) {
  if (score >= 67) return "text-emerald-400";
  if (score >= 34) return "text-amber-400";
  return "text-rose-400";
}

export function recoveryDot(score: number) {
  if (score >= 67) return "bg-emerald-400";
  if (score >= 34) return "bg-amber-400";
  return "bg-rose-400";
}

export function formatWhoopNumber(
  value: number | null | undefined,
  opts?: { digits?: number; suffix?: string; hideZero?: boolean }
): string {
  if (value == null || (opts?.hideZero && value === 0)) return "—";
  const digits = opts?.digits ?? 0;
  const text = digits > 0 ? value.toFixed(digits) : String(Math.round(value));
  return opts?.suffix ? `${text}${opts.suffix}` : text;
}

export function averageMetric(
  days: WearableSnapshot[],
  key: "recovery" | "hrv" | "restingHr" | "sleepScore" | "strain"
): number | null {
  const values = days.map((d) => d[key]).filter((v) => typeof v === "number" && v > 0);
  if (!values.length) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function sparklineValues(
  days: WearableSnapshot[],
  key: "recovery" | "hrv" | "restingHr" | "sleepScore" | "strain",
  limit = 14
): { value: number }[] {
  return [...days]
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .slice(-limit)
    .filter((d) => d[key] > 0)
    .map((d) => ({ value: d[key] }));
}

export function allWhoopDays(data: {
  latest: WearableSnapshot | null;
  history: WearableSnapshot[];
}): WearableSnapshot[] {
  return data.latest ? [data.latest, ...data.history] : [...data.history];
}
