"use client";

import Link from "next/link";
import { BiomarkerCard } from "@/components/cards/biomarker-card";
import { useBiomarkers, useHasUploadedData } from "@/hooks/use-health-data";

interface BiomarkerGridProps {
  limit?: number;
  expanded?: boolean;
}

export function BiomarkerGrid({ limit, expanded }: BiomarkerGridProps) {
  const biomarkers = useBiomarkers();
  const hasUploaded = useHasUploadedData();
  const items = limit ? biomarkers.slice(0, limit) : biomarkers;

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
      {!hasUploaded && (
        <p className="mb-4 text-xs text-muted-foreground">
          Showing demo data — upload a report to replace with your results.
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((b, i) => (
          <BiomarkerCard key={b.id} biomarker={b} delay={i * 0.04} expanded={expanded} />
        ))}
      </div>
    </>
  );
}
