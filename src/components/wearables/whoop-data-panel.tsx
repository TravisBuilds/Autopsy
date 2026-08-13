"use client";

import { Activity, Heart, Loader2, Moon, RefreshCw, Zap } from "lucide-react";
import { HealthCard } from "@/components/cards/health-card";
import { Sparkline } from "@/components/charts/sparkline";
import { SectionHeader } from "@/components/dashboard/section-header";
import { WhoopHistoryList } from "@/components/wearables/whoop-history-list";
import { WhoopTrendCards } from "@/components/wearables/whoop-trend-cards";
import { Button } from "@/components/ui/button";
import { useWhoopData } from "@/hooks/use-whoop-data";
import { formatTimelineDate, normalizeSessionDate } from "@/lib/biomarkers/dates";
import {
  allWhoopDays,
  averageMetric,
  formatWhoopNumber,
  recoveryTone,
  sparklineValues,
} from "@/lib/whoop/format";
import { cn } from "@/lib/utils";
import type { WearableSnapshot } from "@/types/health";

function recoveryRing(score: number) {
  if (score >= 67) return "from-emerald-500/20 to-emerald-500/5 border-emerald-500/25";
  if (score >= 34) return "from-amber-500/20 to-amber-500/5 border-amber-500/25";
  return "from-rose-500/20 to-rose-500/5 border-rose-500/25";
}

function MetricPill({
  icon: Icon,
  label,
  value,
  unit,
  accent,
}: {
  icon: typeof Zap;
  label: string;
  value: string;
  unit?: string;
  accent: string;
}) {
  return (
    <div>
      <Icon className={cn("mb-2 h-4 w-4", accent)} />
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-mono text-lg font-light tabular-nums">
        {value}
        {value !== "—" && unit && (
          <span className="ml-0.5 text-xs text-muted-foreground">{unit}</span>
        )}
      </p>
    </div>
  );
}

function WhoopLatestHero({
  data,
  recoverySeries,
}: {
  data: WearableSnapshot;
  recoverySeries: { value: number }[];
}) {
  return (
    <HealthCard glow delay={0} className="border-sky-500/15">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="flex items-center gap-5">
          <div
            className={cn(
              "flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-full border bg-gradient-to-br",
              recoveryRing(data.recovery)
            )}
          >
            <span className={cn("font-mono text-3xl font-light tabular-nums", recoveryTone(data.recovery))}>
              {data.recovery}
            </span>
            <span className="text-[10px] text-muted-foreground">%</span>
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Recovery · {formatTimelineDate(normalizeSessionDate(data.date))}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Latest scored day</p>
            {recoverySeries.length > 1 && (
              <Sparkline data={recoverySeries} color="#38bdf8" height={40} className="mt-3 w-40" />
            )}
          </div>
        </div>
        <div className="grid min-w-[200px] flex-1 grid-cols-2 gap-4 sm:grid-cols-4">
          <MetricPill
            icon={Zap}
            label="Strain"
            value={formatWhoopNumber(data.strain, { digits: 1, hideZero: true })}
            accent="text-sky-400"
          />
          <MetricPill
            icon={Heart}
            label="HRV"
            value={formatWhoopNumber(data.hrv, { hideZero: true })}
            unit="ms"
            accent="text-violet-400"
          />
          <MetricPill
            icon={Activity}
            label="Resting HR"
            value={formatWhoopNumber(data.restingHr, { hideZero: true })}
            unit="bpm"
            accent="text-rose-300"
          />
          <MetricPill
            icon={Moon}
            label="Sleep"
            value={formatWhoopNumber(data.sleepScore, { hideZero: true })}
            unit="%"
            accent="text-indigo-400"
          />
        </div>
      </div>
    </HealthCard>
  );
}

export function WhoopDataPanel() {
  const { data, loading, error, reload } = useWhoopData();

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-card/40 py-16 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin text-sky-400" />
        Loading WHOOP history…
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="rounded-xl border border-white/[0.08] bg-card/40 p-6 text-center">
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={reload}>
          <RefreshCw className="mr-1.5 h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  if (!data) return null;

  const days = allWhoopDays(data);
  const recoverySeries = sparklineValues(days, "recovery", 14);
  const avgRecovery = averageMetric(days.slice(0, 14), "recovery");
  const avgHrv = averageMetric(days.slice(0, 14), "hrv");
  const displayName = data.profile
    ? `${data.profile.firstName} ${data.profile.lastName}`.trim()
    : null;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          {displayName && (
            <p className="text-xs text-muted-foreground">
              Synced for <span className="text-foreground/90">{displayName}</span>
              {data.profile?.email && (
                <span className="text-muted-foreground/70"> · {data.profile.email}</span>
              )}
            </p>
          )}
          {data.lastSyncedAt && (
            <p className="mt-1 text-[10px] text-muted-foreground/80">
              Last update {formatTimelineDate(normalizeSessionDate(data.lastSyncedAt.slice(0, 10)))}
              {!data.connected && " · reconnect to pull new days"}
            </p>
          )}
        </div>
        {data.connected && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground"
            onClick={reload}
            disabled={loading}
          >
            <RefreshCw className={cn("mr-1.5 h-3.5 w-3.5", loading && "animate-spin")} />
            Update from WHOOP
          </Button>
        )}
      </div>

      {data.daysOnRecord > 0 && (
        <div className="grid gap-3 sm:grid-cols-3">
          <StatChip label="Days on record" value={String(data.daysOnRecord)} />
          <StatChip
            label="Avg recovery (14d)"
            value={formatWhoopNumber(avgRecovery, { hideZero: true, suffix: "%" })}
          />
          <StatChip
            label="Avg HRV (14d)"
            value={formatWhoopNumber(avgHrv, { hideZero: true, suffix: " ms" })}
          />
        </div>
      )}

      {data.status === "pending" && !data.latest && (
        <p className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs text-amber-200/90">
          WHOOP is still scoring your latest recovery. History below stays in place.
        </p>
      )}

      {data.latest ? (
        <section>
          <SectionHeader title="Latest day" description="Recovery, strain, and overnight metrics" />
          <WhoopLatestHero data={data.latest} recoverySeries={recoverySeries} />
        </section>
      ) : data.status === "empty" && data.daysOnRecord === 0 ? (
        <p className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-muted-foreground">
          No scored WHOOP data yet. Wear your band and tap Update — days accumulate here permanently.
        </p>
      ) : null}

      <WhoopTrendCards days={days} />
      <WhoopHistoryList days={days} />
    </div>
  );
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-card/40 px-4 py-3">
      <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-lg font-light tabular-nums">{value}</p>
    </div>
  );
}
