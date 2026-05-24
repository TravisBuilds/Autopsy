"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AlertCard } from "@/components/cards/alert-card";
import { BiomarkerCard } from "@/components/cards/biomarker-card";
import { BiomarkerDetailSheet } from "@/components/biomarkers/biomarker-detail-sheet";
import { CommandCenterInsights } from "@/components/dashboard/command-center-insights";
import { SectionHeader } from "@/components/dashboard/section-header";
import { TimelinePreview } from "@/components/dashboard/timeline-preview";
import { WhoopTodaySection } from "@/components/wearables/whoop-today-section";
import { buttonVariants } from "@/components/ui/button";
import { useCommandCenterAnalysis } from "@/hooks/use-command-center";
import {
  useAlerts,
  useHasUploadedData,
  usePriorityBiomarkers,
  useTestSessions,
  useTimeline,
} from "@/hooks/use-health-data";
import { geneticFlagForBiomarker } from "@/lib/command-center/analyze";
import { APP_TAGLINE } from "@/lib/brand";
import { cn } from "@/lib/utils";
import type { BiomarkerReading } from "@/types/health";

function EmptyHint({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-muted-foreground">
      {children}{" "}
      <Link href={href} className="text-teal-400 hover:underline">
        Get started →
      </Link>
    </p>
  );
}

export function HomeDashboard() {
  const [selected, setSelected] = useState<BiomarkerReading | null>(null);
  const priorityBiomarkers = usePriorityBiomarkers(3);
  const alerts = useAlerts();
  const timeline = useTimeline();
  const sessions = useTestSessions();
  const hasUploaded = useHasUploadedData();
  const { analysis, loading } = useCommandCenterAnalysis();

  const sessionIdByEventId = useMemo(
    () =>
      Object.fromEntries(sessions.map((s) => [`timeline-${s.id}`, s.id] as const)),
    [sessions]
  );

  const featured = priorityBiomarkers[0];
  const priorityRest = priorityBiomarkers.slice(1);

  return (
    <>
      <div className="mb-8">
        <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
          {APP_TAGLINE}
        </p>
        <h2 className="mt-2 text-2xl font-light tracking-tight">
          Your health intelligence at a glance
        </h2>
        {hasUploaded ? (
          <p className="mt-2 text-xs text-teal-400/90">From your uploaded lab panels</p>
        ) : (
          <p className="mt-2 text-xs text-muted-foreground">
            Upload lab PDFs to build your archive —{" "}
            <Link href="/upload" className="text-teal-400 hover:underline">
              multiple files at once
            </Link>
          </p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <section>
            <SectionHeader
              title="Priority biomarkers"
              description={
                hasUploaded
                  ? "Out of range on your latest panel — lipids & metabolic first"
                  : "No data yet"
              }
              action={
                hasUploaded ? (
                  <Link
                    href="/biomarkers"
                    className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-xs")}
                  >
                    View all <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                ) : undefined
              }
            />
            {featured ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <BiomarkerCard
                  biomarker={featured}
                  delay={0}
                  expanded
                  showTrend
                  geneticLink={geneticFlagForBiomarker(analysis, featured)}
                  onClick={() => setSelected(featured)}
                />
                {priorityRest.map((b, i) => (
                  <BiomarkerCard
                    key={b.id}
                    biomarker={b}
                    delay={(i + 1) * 0.05}
                    showTrend
                    geneticLink={geneticFlagForBiomarker(analysis, b)}
                    onClick={() => setSelected(b)}
                  />
                ))}
              </div>
            ) : hasUploaded ? (
              <p className="rounded-xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-muted-foreground">
                All markers on your latest panel are within lab reference ranges.
              </p>
            ) : (
              <EmptyHint href="/upload">Upload your first lab panel to see biomarkers here.</EmptyHint>
            )}
          </section>
        </div>

        <div className="space-y-6 lg:col-span-4">
          <section>
            <SectionHeader
              title="Reference notes"
              description="Out of range on latest panel, by priority"
            />
            {alerts.length > 0 ? (
              <div className="space-y-3">
                {alerts.slice(0, 3).map((alert, i) => {
                  const geneticFlag = analysis?.geneticFlags.find(
                    (f) => f.source === "lab" && alert.title.startsWith(f.biomarkerName)
                  );
                  return (
                    <AlertCard
                      key={alert.id}
                      alert={alert}
                      delay={i * 0.05}
                      genomeNote={geneticFlag?.explanation}
                    />
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No panels uploaded yet.</p>
            )}
          </section>
        </div>
      </div>

      <div className="mt-8">
        <WhoopTodaySection />
      </div>

      <CommandCenterInsights analysis={analysis} loading={loading} />

      <section className="mt-8">
        <SectionHeader
          title="Timeline preview"
          description="Lab panels over time"
          action={
            hasUploaded ? (
              <Link
                href="/timeline"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-xs")}
              >
                Open timeline
              </Link>
            ) : undefined
          }
        />
        {timeline.length > 0 ? (
          <div className="rounded-2xl border border-white/[0.06] bg-card/40 p-6 backdrop-blur-xl">
            <TimelinePreview events={timeline} sessionIdByEventId={sessionIdByEventId} />
          </div>
        ) : (
          <EmptyHint href="/upload">Upload lab reports to build your timeline.</EmptyHint>
        )}
      </section>

      <BiomarkerDetailSheet
        biomarker={selected}
        open={selected !== null}
        onOpenChange={(open) => !open && setSelected(null)}
      />
    </>
  );
}
