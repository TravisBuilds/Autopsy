"use client";

import { Activity, Heart, Loader2, Moon, RefreshCw, Zap } from "lucide-react";
import { WearableCard } from "@/components/cards/wearable-card";
import { HealthCard } from "@/components/cards/health-card";
import { SectionHeader } from "@/components/dashboard/section-header";
import { Button } from "@/components/ui/button";
import { useWhoopData } from "@/hooks/use-whoop-data";
import { cn } from "@/lib/utils";
import type { WearableSnapshot } from "@/types/health";

function recoveryTone(score: number) {
  if (score >= 67) return "text-emerald-400";
  if (score >= 34) return "text-amber-400";
  return "text-rose-400";
}

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
        {unit && <span className="ml-0.5 text-xs text-muted-foreground">{unit}</span>}
      </p>
    </div>
  );
}

function WhoopLatestHero({ data }: { data: WearableSnapshot }) {
  return (
    <HealthCard glow delay={0} className="border-sky-500/15">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <WhoopLatestHeroLeft data={data} />
        <div className="grid min-w-[200px] flex-1 grid-cols-2 gap-4 sm:grid-cols-4">
          <MetricPill icon={Zap} label="Strain" value={data.strain.toFixed(1)} accent="text-sky-400" />
          <MetricPill icon={Heart} label="HRV" value={`${data.hrv}`} unit="ms" accent="text-violet-400" />
          <MetricPill
            icon={Activity}
            label="Resting HR"
            value={`${data.restingHr}`}
            unit="bpm"
            accent="text-rose-300"
          />
          <MetricPill icon={Moon} label="Sleep" value={`${data.sleepScore}`} unit="%" accent="text-indigo-400" />
        </div>
      </div>
    </HealthCard>
  );
}

function WhoopLatestHeroLeft({ data }: { data: WearableSnapshot }) {
  return (
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
          Recovery · {data.date}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">Latest scored day from WHOOP</p>
      </div>
    </div>
  );
}

export function WhoopDataPanel() {
  const { data, loading, error, reload } = useWhoopData();

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-card/40 py-16 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin text-sky-400" />
        Loading WHOOP data…
      </div>
    );
  }

  if (error) {
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

  const displayName = data.profile
    ? `${data.profile.firstName} ${data.profile.lastName}`.trim()
    : null;

  return (
    <div className="space-y-8">
      {displayName && (
        <p className="text-xs text-muted-foreground">
          Synced for <span className="text-foreground/90">{displayName}</span>
          {data.profile?.email && (
            <span className="text-muted-foreground/70"> · {data.profile.email}</span>
          )}
        </p>
      )}

      {data.status === "pending" && !data.latest && (
        <p className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs text-amber-200/90">
          WHOOP is still scoring your latest recovery. Check back in a few minutes.
        </p>
      )}

      {data.latest ? (
        <section>
          <SectionHeader title="Today" description="Latest recovery & strain from WHOOP" />
          <WhoopLatestHero data={data.latest} />
        </section>
      ) : data.status === "empty" ? (
        <p className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-muted-foreground">
          No scored WHOOP data yet. Wear your band and sync — metrics appear after your next recovery is scored.
        </p>
      ) : null}

      {data.history.length > 0 && (
        <section>
          <SectionHeader
            title="Recent days"
            description={`${data.history.length} prior scored ${data.history.length === 1 ? "day" : "days"}`}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {data.history.map((day, i) => (
              <WearableCard key={`${day.date}-${i}`} data={day} delay={(i + 1) * 0.05} />
            ))}
          </div>
        </section>
      )}

      <div className="flex justify-end">
        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={reload}>
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>
    </div>
  );
}
