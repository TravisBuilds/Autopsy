import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AlertCard } from "@/components/cards/alert-card";
import { BiomarkerCard } from "@/components/cards/biomarker-card";
import { InsightCard } from "@/components/cards/insight-card";
import { InterventionCard } from "@/components/cards/intervention-card";
import { WearableCard } from "@/components/cards/wearable-card";
import { SectionHeader } from "@/components/dashboard/section-header";
import { TimelinePreview } from "@/components/dashboard/timeline-preview";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import {
  mockAlerts,
  mockBiomarkers,
  mockInsights,
  mockInterventions,
  mockTimeline,
  mockWearable,
} from "@/lib/mock-data";

export default function HomePage() {
  const featured = mockBiomarkers[0];

  return (
    <AppShell title="Command Center" subtitle="Biological snapshot · May 17, 2026">
      <div className="mb-8">
        <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
          Biological operating system
        </p>
        <h2 className="mt-2 text-2xl font-light tracking-tight">
          Your health intelligence at a glance
        </h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-6">
          <section>
            <SectionHeader
              title="Priority biomarkers"
              description="Latest panel · Mar 11, 2026"
              action={
                <Button variant="ghost" size="sm" className="text-xs" asChild>
                  <Link href="/biomarkers">
                    View all <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              }
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <BiomarkerCard biomarker={featured} delay={0} expanded />
              {mockBiomarkers.slice(1, 3).map((b, i) => (
                <BiomarkerCard key={b.id} biomarker={b} delay={(i + 1) * 0.05} />
              ))}
            </div>
          </section>

          <section>
            <SectionHeader title="AI insights" description="Interpretive summaries — not diagnosis" />
            <div className="grid gap-4 sm:grid-cols-2">
              {mockInsights.map((insight, i) => (
                <InsightCard key={insight.id} insight={insight} delay={i * 0.05} />
              ))}
            </div>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <section>
            <SectionHeader title="Active alerts" />
            <div className="space-y-3">
              {mockAlerts.map((alert, i) => (
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
                <Button variant="ghost" size="sm" className="text-xs" asChild>
                  <Link href="/interventions">Manage</Link>
                </Button>
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
          description="2023 — 2026 longitudinal view"
          action={
            <Button variant="ghost" size="sm" className="text-xs" asChild>
              <Link href="/timeline">Open timeline</Link>
            </Button>
          }
        />
        <div className="rounded-2xl border border-white/[0.06] bg-card/40 p-6 backdrop-blur-xl">
          <TimelinePreview events={mockTimeline} />
        </div>
      </section>
    </AppShell>
  );
}
