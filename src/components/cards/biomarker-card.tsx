"use client";

import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { Sparkline } from "@/components/charts/sparkline";
import { HealthCard } from "@/components/cards/health-card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
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

const flagStyles: Record<string, string> = {
  high: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  low: "text-sky-400 bg-sky-400/10 border-sky-400/20",
  normal: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  critical: "text-red-400 bg-red-400/10 border-red-400/20",
};

interface BiomarkerCardProps {
  biomarker: BiomarkerReading;
  delay?: number;
  expanded?: boolean;
}

export function BiomarkerCard({ biomarker, delay = 0, expanded }: BiomarkerCardProps) {
  const sparkData = biomarker.history?.map((h) => ({ value: h.value })) ?? [];
  const TrendIcon =
    biomarker.flag === "high"
      ? ArrowUp
      : biomarker.flag === "low"
        ? ArrowDown
        : Minus;

  return (
    <HealthCard delay={delay} glow={biomarker.flag === "high" || biomarker.flag === "critical"}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            {categoryLabels[biomarker.category] ?? biomarker.category}
          </p>
          <h3 className="mt-1 text-sm font-medium text-foreground/90">{biomarker.markerName}</h3>
        </div>
        <Badge variant="outline" className={cn("text-[10px] capitalize", flagStyles[biomarker.flag])}>
          {biomarker.flag}
        </Badge>
      </div>

      <div className="mt-4 flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-3xl font-light tracking-tight tabular-nums">
            {biomarker.value}
            <span className="ml-1.5 text-sm text-muted-foreground">{biomarker.unit}</span>
          </p>
          {biomarker.changePercent !== undefined && (
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <TrendIcon className="h-3 w-3 text-amber-400" />
              <span className={biomarker.changePercent > 0 ? "text-amber-400" : "text-emerald-400"}>
                {biomarker.changePercent > 0 ? "+" : ""}
                {biomarker.changePercent}%
              </span>
              <span>vs prior panel</span>
            </p>
          )}
        </div>
        {sparkData.length > 1 && (
          <div className="w-24 shrink-0 opacity-80">
            <Sparkline
              data={sparkData}
              color={biomarker.flag === "high" ? "#fbbf24" : "var(--accent-glow)"}
              height={40}
            />
          </div>
        )}
      </div>

      <p className="mt-2 font-mono text-[10px] text-muted-foreground/70">
        Ref {biomarker.referenceLow}–{biomarker.referenceHigh} {biomarker.unit}
      </p>

      {expanded && biomarker.insight && (
        <p className="mt-4 border-t border-white/[0.06] pt-4 text-xs leading-relaxed text-muted-foreground">
          {biomarker.insight}
        </p>
      )}
    </HealthCard>
  );
}
