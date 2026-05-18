"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BiomarkerCard } from "@/components/cards/biomarker-card";
import { BiomarkerDetailSheet } from "@/components/biomarkers/biomarker-detail-sheet";
import { PanelHistoryList } from "@/components/biomarkers/panel-history-list";
import { DataMigrationBanner } from "@/components/dashboard/data-migration-banner";
import { SectionHeader } from "@/components/dashboard/section-header";
import { useBiomarkers, useHasUploadedData, useTestSessions } from "@/hooks/use-health-data";
import { getMarkerPanelCount } from "@/lib/biomarkers/session-history";
import { cn } from "@/lib/utils";
import type { BiomarkerCategory, BiomarkerReading } from "@/types/health";

const CATEGORIES: { id: BiomarkerCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "cardiovascular", label: "Cardiovascular" },
  { id: "metabolic", label: "Metabolic" },
  { id: "hematology", label: "Hematology" },
  { id: "inflammation", label: "Inflammation" },
  { id: "liver", label: "Liver" },
  { id: "kidney", label: "Kidney" },
  { id: "hormones", label: "Hormones" },
  { id: "vitamins", label: "Vitamins" },
];

export function BiomarkerDashboard() {
  const biomarkers = useBiomarkers();
  const sessions = useTestSessions();
  const hasUploaded = useHasUploadedData();
  const [category, setCategory] = useState<BiomarkerCategory | "all">("all");
  const [selected, setSelected] = useState<BiomarkerReading | null>(null);

  const filtered = useMemo(() => {
    if (category === "all") return biomarkers;
    return biomarkers.filter((b) => b.category === category);
  }, [biomarkers, category]);

  const stats = useMemo(() => {
    const panelCount = sessions.length;
    const withMultiPanel = biomarkers.filter(
      (b) => getMarkerPanelCount(b.id, sessions) >= 2
    ).length;
    return { markers: biomarkers.length, panelCount, withMultiPanel };
  }, [biomarkers, sessions]);

  if (biomarkers.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-muted-foreground">
        No biomarkers yet.{" "}
        <Link href="/upload" className="text-teal-400 hover:underline">
          Upload a lab report
        </Link>
      </p>
    );
  }

  return (
    <>
      <DataMigrationBanner />

      {!hasUploaded && (
        <p className="mb-4 text-xs text-muted-foreground">
          No panels yet.{" "}
          <Link href="/upload" className="text-teal-400 hover:underline">
            Upload PDFs
          </Link>{" "}
          — you can select multiple files at once.
        </p>
      )}

      {hasUploaded && sessions.length > 0 && <PanelHistoryList sessions={sessions} />}

      <div className="mb-6 grid grid-cols-3 gap-3 sm:max-w-lg">
        <Stat label="Lab panels" value={stats.panelCount} />
        <Stat label="Unique markers" value={stats.markers} />
        <Stat label="Multi-panel markers" value={stats.withMultiPanel} />
      </div>

      <section>
        <SectionHeader
          title="By marker"
          description="Click any marker for full panel-by-panel history and chart"
        />

        <div className="mb-4 flex flex-wrap gap-2">
          {CATEGORIES.filter(
            (c) => c.id === "all" || biomarkers.some((b) => b.category === c.id)
          ).map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.id)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs transition-all",
                category === c.id
                  ? "bg-white/10 text-foreground ring-1 ring-white/15"
                  : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
              )}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((b, i) => (
            <BiomarkerCard
              key={b.id}
              biomarker={b}
              delay={i * 0.03}
              showTrend
              onClick={() => setSelected(b)}
            />
          ))}
        </div>
      </section>

      <BiomarkerDetailSheet
        biomarker={selected}
        open={selected !== null}
        onOpenChange={(open) => !open && setSelected(null)}
      />
    </>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-card/40 px-4 py-3">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-2xl font-light tabular-nums">{value}</p>
    </div>
  );
}
