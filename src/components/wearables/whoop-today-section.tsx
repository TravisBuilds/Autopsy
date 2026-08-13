"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import { HealthCard } from "@/components/cards/health-card";
import { Sparkline } from "@/components/charts/sparkline";
import { SectionHeader } from "@/components/dashboard/section-header";
import { buttonVariants } from "@/components/ui/button";
import { useWhoopData } from "@/hooks/use-whoop-data";
import { formatTimelineDate, normalizeSessionDate } from "@/lib/biomarkers/dates";
import {
  allWhoopDays,
  formatWhoopNumber,
  recoveryTone,
  sparklineValues,
} from "@/lib/whoop/format";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

export function WhoopTodaySection() {
  const user = useAuthStore((s) => s.user);
  const { whoopConnected, data, loading, error } = useWhoopData();
  const days = data ? allWhoopDays(data) : [];
  const recoverySeries = sparklineValues(days, "recovery", 14);
  const latest = data?.latest;

  return (
    <section>
      <SectionHeader
        title="WHOOP"
        description={
          latest
            ? `${formatTimelineDate(normalizeSessionDate(latest.date))} · ${data?.daysOnRecord ?? 0} days on record`
            : data?.daysOnRecord
              ? `${data.daysOnRecord} days saved`
              : "Recovery, HRV & strain"
        }
        action={
          <Link
            href="/wearables"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-xs")}
          >
            {whoopConnected || (data?.daysOnRecord ?? 0) > 0 ? "History" : "Connect"}
          </Link>
        }
      />

      {!user && (
        <p className="rounded-xl border border-dashed border-white/10 px-4 py-5 text-center text-xs text-muted-foreground">
          Sign in to keep WHOOP history across devices.{" "}
          <Link href="/login" className="text-sky-400 hover:underline">
            Sign in →
          </Link>
        </p>
      )}

      {user && loading && !data && (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-card/40 py-10 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-sky-400" />
          Loading WHOOP…
        </div>
      )}

      {user && error && !data && (
        <p className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-3 text-xs text-muted-foreground">
          Could not load WHOOP data.{" "}
          <Link href="/wearables" className="text-sky-400 hover:underline">
            Open wearables
          </Link>
        </p>
      )}

      {user && latest && (
        <HealthCard delay={0} className="border-sky-500/10 p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Recovery</p>
              <p className={cn("font-mono text-3xl font-light tabular-nums", recoveryTone(latest.recovery))}>
                {latest.recovery}
                <span className="ml-1 text-sm text-muted-foreground">%</span>
              </p>
              <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                HRV {formatWhoopNumber(latest.hrv, { hideZero: true, suffix: " ms" })}
                {" · "}
                Strain {formatWhoopNumber(latest.strain, { digits: 1, hideZero: true })}
                {" · "}
                Sleep {formatWhoopNumber(latest.sleepScore, { hideZero: true, suffix: "%" })}
              </p>
            </div>
            {recoverySeries.length > 1 && (
              <Sparkline data={recoverySeries} color="#38bdf8" height={56} className="w-40 sm:w-56" />
            )}
          </div>
        </HealthCard>
      )}

      {user && !loading && !latest && data?.status === "pending" && (
        <p className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs text-amber-200/90">
          WHOOP is scoring your latest recovery. Saved history is still on Wearables.
        </p>
      )}

      {user && !loading && !latest && (data?.daysOnRecord ?? 0) === 0 && !error && (
        <p className="rounded-xl border border-dashed border-white/10 px-4 py-5 text-center text-xs text-muted-foreground">
          {whoopConnected ? (
            <>No scored data yet. Sync your band — days stay saved after that.</>
          ) : (
            <>
              Connect WHOOP to start a permanent history.{" "}
              <Link href="/wearables" className="text-sky-400 hover:underline">
                Set up →
              </Link>
            </>
          )}
        </p>
      )}
    </section>
  );
}
