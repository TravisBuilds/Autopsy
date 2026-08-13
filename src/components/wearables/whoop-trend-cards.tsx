"use client";

import { HealthCard } from "@/components/cards/health-card";
import { Sparkline } from "@/components/charts/sparkline";
import { formatWhoopNumber, sparklineValues } from "@/lib/whoop/format";
import type { WearableSnapshot } from "@/types/health";

const TRENDS = [
  { key: "recovery", label: "Recovery", suffix: "%", color: "#38bdf8" },
  { key: "hrv", label: "HRV", suffix: " ms", color: "#a78bfa" },
  { key: "sleepScore", label: "Sleep", suffix: "%", color: "#818cf8" },
  { key: "strain", label: "Strain", digits: 1, color: "#22d3ee" },
] as const;

export function WhoopTrendCards({ days }: { days: WearableSnapshot[] }) {
  if (days.length < 2) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {TRENDS.map((trend) => {
        const series = sparklineValues(days, trend.key, 14);
        const latest = series[series.length - 1]?.value;
        const prior = series.length > 1 ? series[series.length - 2]?.value : undefined;
        const delta =
          latest != null && prior != null && prior !== 0
            ? ((latest - prior) / prior) * 100
            : null;

        return (
          <HealthCard key={trend.key} delay={0.05} className="p-4">
            <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              {trend.label}
            </p>
            <p className="mt-1 font-mono text-xl font-light tabular-nums">
              {formatWhoopNumber(latest, {
                digits: "digits" in trend ? trend.digits : 0,
                suffix: "suffix" in trend ? trend.suffix : undefined,
                hideZero: true,
              })}
            </p>
            {delta != null && (
              <p
                className={`mt-0.5 text-[10px] ${
                  delta >= 0 ? "text-emerald-400/90" : "text-rose-400/90"
                }`}
              >
                {delta >= 0 ? "+" : ""}
                {delta.toFixed(0)}% vs prior day
              </p>
            )}
            {series.length > 1 && (
              <Sparkline data={series} color={trend.color} height={36} className="mt-2" />
            )}
          </HealthCard>
        );
      })}
    </div>
  );
}
