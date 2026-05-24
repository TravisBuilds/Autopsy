"use client";

import { useMemo } from "react";
import { Sparkline } from "@/components/charts/sparkline";
import { TrendBadge } from "@/components/charts/trend-badge";
import { HealthCard } from "@/components/cards/health-card";
import { Badge } from "@/components/ui/badge";
import { toChartSeries } from "@/lib/biomarkers/chart-data";
import { getBiomarkerDescriptionOrFallback } from "@/lib/biomarkers/descriptions";
import { flagShort } from "@/lib/biomarkers/reference-labels";
import { getMarkerPanelCount } from "@/lib/biomarkers/session-history";
import { classifyTrend } from "@/lib/biomarkers/trends";
import { useHealthStore } from "@/stores/health-store";
import { cn } from "@/lib/utils";
import type { GeneticBiomarkerFlag } from "@/types/command-center";
import type { BiomarkerReading } from "@/types/health";

const categoryLabels: Record<string, string> = {
  cardiovascular: "Cardiovascular",
  metabolic: "Metabolic",
  liver: "Liver",
  hematology: "Hematology",
  kidney: "Kidney",
  inflammation: "Inflammation",
  hormones: "Hormones",
  vitamins: "Vitamins",
};

interface BiomarkerCardProps {
  biomarker: BiomarkerReading;
  delay?: number;
  expanded?: boolean;
  showTrend?: boolean;
  geneticLink?: GeneticBiomarkerFlag;
  onClick?: () => void;
}

export function BiomarkerCard({
  biomarker,
  delay = 0,
  expanded,
  showTrend,
  geneticLink,
  onClick,
}: BiomarkerCardProps) {
  const sessions = useHealthStore((s) => s.testSessions);

  const series = useMemo(
    () => toChartSeries(biomarker, sessions),
    [biomarker, sessions]
  );
  const panelCount = useMemo(
    () => (sessions.length > 0 ? getMarkerPanelCount(biomarker.id, sessions) : series.length),
    [biomarker.id, sessions, series.length]
  );
  const trend = showTrend ? classifyTrend(biomarker, sessions) : null;
  const sparkData = series.map((p) => ({ value: p.value }));
  const description = getBiomarkerDescriptionOrFallback(biomarker.markerName);

  return (
    <HealthCard delay={delay} onClick={onClick}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            {categoryLabels[biomarker.category] ?? biomarker.category}
          </p>
          <h3 className="mt-1 text-sm font-medium text-foreground/90">{biomarker.markerName}</h3>
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          {panelCount > 0 && (
            <span className="text-[10px] text-teal-400/90">
              {panelCount} panel{panelCount !== 1 ? "s" : ""}
            </span>
          )}
          <Badge
            variant="outline"
            className="border-white/10 bg-white/[0.03] text-[10px] text-muted-foreground"
          >
            {flagShort(biomarker.flag)}
          </Badge>
          {trend && trend.classification !== "insufficient" && (
            <TrendBadge classification={trend.classification} label={trend.label} />
          )}
        </div>
      </div>

      <div className="mt-4 flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-3xl font-light tracking-tight tabular-nums">
            {biomarker.value}
            <span className="ml-1.5 text-sm text-muted-foreground">{biomarker.unit}</span>
          </p>
          {series.length >= 2 && trend?.percentChange !== undefined && (
            <p className="mt-1 text-xs text-muted-foreground">
              <span
                className={
                  trend.percentChange > 0 ? "text-muted-foreground" : "text-muted-foreground"
                }
              >
                {trend.percentChange > 0 ? "+" : ""}
                {trend.percentChange}%
              </span>{" "}
              first → latest panel
            </p>
          )}
        </div>
        {sparkData.length > 1 && (
          <div className="w-24 shrink-0 opacity-80">
            <Sparkline data={sparkData} color="var(--accent-glow)" height={40} />
          </div>
        )}
      </div>

      <p className="mt-2 font-mono text-[10px] text-muted-foreground/70">
        Lab ref. {biomarker.referenceLow}–{biomarker.referenceHigh} {biomarker.unit}
      </p>

      {geneticLink && (
        <p className="mt-3 rounded-lg border border-violet-500/20 bg-violet-500/5 px-3 py-2 text-[10px] leading-relaxed text-violet-100/85">
          <span className="font-medium text-violet-200">Genome-linked · </span>
          {[...new Set(geneticLink.linkedVariants.map((v) => v.gene))].join(", ")} —{" "}
          {geneticLink.explanation}
        </p>
      )}

      {expanded && biomarker.insight && (
        <p className="mt-4 border-t border-white/[0.06] pt-4 text-xs leading-relaxed text-muted-foreground">
          {biomarker.insight}
        </p>
      )}
    </HealthCard>
  );
}
