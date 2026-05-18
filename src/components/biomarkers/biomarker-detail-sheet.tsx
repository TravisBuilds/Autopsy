"use client";

import { useMemo } from "react";
import { BiomarkerChart } from "@/components/charts/biomarker-chart";
import { TrendBadge } from "@/components/charts/trend-badge";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { getBiomarkerDescriptionOrFallback } from "@/lib/biomarkers/descriptions";
import { flagLabel, referenceStatusLabel } from "@/lib/biomarkers/reference-labels";
import { getMarkerHistoryFromSessions } from "@/lib/biomarkers/session-history";
import { classifyTrend } from "@/lib/biomarkers/trends";
import { useHealthStore } from "@/stores/health-store";
import { cn } from "@/lib/utils";
import type { BiomarkerReading } from "@/types/health";

const flagStyles: Record<string, string> = {
  high: "text-muted-foreground border-white/10 bg-white/5",
  low: "text-muted-foreground border-white/10 bg-white/5",
  normal: "text-muted-foreground border-white/10 bg-white/5",
  critical: "text-amber-400/90 border-amber-400/20 bg-amber-400/5",
};

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

interface BiomarkerDetailSheetProps {
  biomarker: BiomarkerReading | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BiomarkerDetailSheet({
  biomarker,
  open,
  onOpenChange,
}: BiomarkerDetailSheetProps) {
  const sessions = useHealthStore((s) => s.testSessions);

  const history = useMemo(() => {
    if (!biomarker) return [];
    return getMarkerHistoryFromSessions(biomarker.id, sessions, {
      low: biomarker.referenceLow,
      high: biomarker.referenceHigh,
    });
  }, [biomarker, sessions]);

  if (!biomarker) return null;

  const trend = classifyTrend(biomarker, sessions);
  const latest = history[history.length - 1];
  const description = getBiomarkerDescriptionOrFallback(biomarker.markerName);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader className="border-b border-white/[0.06] pb-4">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            {categoryLabels[biomarker.category] ?? biomarker.category}
          </p>
          <SheetTitle className="text-xl font-light">{biomarker.markerName}</SheetTitle>
          <SheetDescription className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {description}
          </SheetDescription>
          <div className="flex flex-wrap items-center gap-2 pt-3">
            <Badge variant="outline" className={cn("text-[10px]", flagStyles[biomarker.flag])}>
              {flagLabel(biomarker.flag)}
            </Badge>
            {trend.classification !== "insufficient" && (
              <TrendBadge classification={trend.classification} label={trend.label} />
            )}
            <span className="text-[10px] text-muted-foreground">
              {history.length} panel{history.length !== 1 ? "s" : ""} on record
            </span>
          </div>
        </SheetHeader>

        <div className="space-y-6 p-4">
          <div>
            <p className="font-mono text-4xl font-light tabular-nums">
              {latest?.value ?? biomarker.value}
              <span className="ml-2 text-lg text-muted-foreground">{biomarker.unit}</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {history.length > 0
                ? `Latest of ${history.length} recorded panels`
                : "Latest panel"}
              {latest && ` · ${latest.label}`}
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-card/30 p-4">
            <p className="mb-3 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              All panels
            </p>
            <BiomarkerChart biomarker={biomarker} height={240} />
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <p className="text-xs leading-relaxed text-muted-foreground">{trend.description}</p>
          </div>

          <div>
            <p className="mb-2 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              Full history
            </p>
            {history.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                This marker was not reported in your uploaded panels.
              </p>
            ) : (
              <div className="overflow-hidden rounded-lg border border-white/[0.06]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06] bg-white/[0.02] text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                      <th className="px-3 py-2">Panel date</th>
                      <th className="px-3 py-2">Value</th>
                      <th className="px-3 py-2">vs lab reference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...history].reverse().map((row) => (
                      <tr key={`${row.sessionId}-${row.date}`} className="border-b border-white/[0.04]">
                        <td className="px-3 py-2">
                          <p className="font-mono text-xs">{row.label}</p>
                          {row.sourceFileName && (
                            <p className="truncate text-[10px] text-muted-foreground">
                              {row.sourceFileName}
                            </p>
                          )}
                        </td>
                        <td className="px-3 py-2 font-mono tabular-nums">
                          {row.value} {biomarker.unit}
                        </td>
                        <td className="px-3 py-2 text-[10px] text-muted-foreground">
                          {referenceStatusLabel(
                            row.inRange,
                            row.value,
                            biomarker.referenceLow,
                            biomarker.referenceHigh
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {biomarker.insight && (
            <p className="text-xs leading-relaxed text-muted-foreground">{biomarker.insight}</p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
