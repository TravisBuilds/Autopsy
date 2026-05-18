"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import { WearableCard } from "@/components/cards/wearable-card";
import { SectionHeader } from "@/components/dashboard/section-header";
import { buttonVariants } from "@/components/ui/button";
import { useWhoopData } from "@/hooks/use-whoop-data";
import { cn } from "@/lib/utils";

export function WhoopTodaySection() {
  const { whoopConnected, data, loading, error } = useWhoopData();

  return (
    <section>
      <SectionHeader
        title="WHOOP today"
        description={
          whoopConnected && data?.latest
            ? `Recovery · ${data.latest.date}`
            : "Recovery, HRV & strain"
        }
        action={
          <Link
            href="/wearables"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-xs")}
          >
            {whoopConnected ? "Details" : "Connect"}
          </Link>
        }
      />

      {!whoopConnected && (
        <p className="rounded-xl border border-dashed border-white/10 px-4 py-5 text-center text-xs text-muted-foreground">
          Connect WHOOP to see today&apos;s recovery here.{" "}
          <Link href="/wearables" className="text-sky-400 hover:underline">
            Set up →
          </Link>
        </p>
      )}

      {whoopConnected && loading && (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-card/40 py-10 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-sky-400" />
          Syncing WHOOP…
        </div>
      )}

      {whoopConnected && error && (
        <p className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-3 text-xs text-muted-foreground">
          Could not load WHOOP data.{" "}
          <Link href="/wearables" className="text-sky-400 hover:underline">
            Open wearables
          </Link>
        </p>
      )}

      {whoopConnected && !loading && !error && data?.status === "pending" && !data.latest && (
        <p className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs text-amber-200/90">
          WHOOP is scoring your latest recovery.
        </p>
      )}

      {whoopConnected && !loading && !error && data?.latest && (
        <WearableCard data={data.latest} delay={0} />
      )}

      {whoopConnected && !loading && !error && data?.status === "empty" && (
        <p className="rounded-xl border border-dashed border-white/10 px-4 py-5 text-center text-xs text-muted-foreground">
          No scored data yet. Sync your band and check back after recovery is scored.
        </p>
      )}
    </section>
  );
}
