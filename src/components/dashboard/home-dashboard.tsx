"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AlertCard } from "@/components/cards/alert-card";
import { BiomarkerCard } from "@/components/cards/biomarker-card";
import { InsightCard } from "@/components/cards/insight-card";
import { InterventionCard } from "@/components/cards/intervention-card";
import { WearableCard } from "@/components/cards/wearable-card";
import { SectionHeader } from "@/components/dashboard/section-header";
import { TimelinePreview } from "@/components/dashboard/timeline-preview";
import { buttonVariants } from "@/components/ui/button";
import { useAlerts, useBiomarkers, useHasUploadedData, useTimeline } from "@/hooks/use-health-data";
import { mockInsights, mockInterventions, mockWearable } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function HomeDashboard() {
  const biomarkers = useBiomarkers();
  const alerts = useAlerts();
  const timeline = useTimeline();
  const hasUploaded = useHasUploadedData();

  const featured = biomarkers[0];
  const priority = biomarkers.slice(0, 3);

  return (
    <>
      <div className="mb-8">
        <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
          Biological operating system
        </p>
        <h2 className="mt-2 text-2xl font-light tracking-tight">
          Your health intelligence at a glance
        </h2>
        {hasUploaded && (
          <p className="mt-2 text-xs text-teal-400/90">
            Live data from your uploaded panels
          </p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <section>
            <SectionHeader
              title="Priority biomarkers"
              description={hasUploaded ? "From your latest upload" : "Demo panel · Mar 11, 2026"}
              action={
                <Link
                  href="/biomarkers"
                  className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-xs")}
                >
                  View all <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              }
            />
            {featured ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <BiomarkerCard biomarker={featured} delay={0} expanded />
                {priority.slice(1).map((b, i) => (
                  <BiomarkerCard key={b.id} biomarker={b} delay={(i + 1) * 0.05} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                <Link href="/upload" className="text-teal-400 hover:underline">
                  Upload your first lab report
                </Link>
              </p>
            )}
          </section>

          <section>
            <SectionHeader
              title="AI insights"
              description="Interpretive summaries — not diagnosis"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              {mockInsights.map((insight, i) => (
                <InsightCard key={insight.id} insight={insight} delay={i * 0.05} />
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6 lg:col-span-4">
          <section>
            <SectionHeader title="Active alerts" />
            <div className="space-y-3">
              {alerts.slice(0, 3).map((alert, i) => (
                <AlertCard key={alert.id} alert={alert} delay={i * 0.05} />
              ))}
            </div>
          </section>

          <section>
            <SectionHeader title="WHOOP" />
            <WearableCard data={mockWearable} />
          </section>

          <section>
            <SectionHeader
              title="Active interventions"
              action={
                <Link
                  href="/interventions"
                  className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-xs")}
                >
                  Manage
                </Link>
              }
            />
            <div className="space-y-3">
              {mockInterventions.slice(0, 2).map((item, i) => (
                <InterventionCard key={item.id} intervention={item} delay={i * 0.05} />
              ))}
            </div>
          </section>
        </div>
      </div>

      <section className="mt-8">
        <SectionHeader
          title="Timeline preview"
          description="Longitudinal view"
          action={
            <Link
              href="/timeline"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-xs")}
            >
              Open timeline
            </Link>
          }
        />
        <div className="rounded-2xl border border-white/[0.06] bg-card/40 p-6 backdrop-blur-xl">
          <TimelinePreview events={timeline} />
        </div>
      </section>
    </>
  );
}
