"use client";

import { formatChartDate } from "@/lib/biomarkers/dates";
import {
  getMarkerDateKey,
  getMarkerId,
  getTimelineYearSpanFromMarkers,
  type TimelineAxisMarker,
} from "@/lib/biomarkers/timeline-axis";
import { cn } from "@/lib/utils";

export type TimelineSelection =
  | { kind: "panel"; sessionId: string }
  | { kind: "intervention"; interventionId: string };

interface InteractiveTimelineProps {
  markers: TimelineAxisMarker[];
  selection: TimelineSelection | null;
  onSelect: (selection: TimelineSelection) => void;
}

export function InteractiveTimeline({ markers, selection, onSelect }: InteractiveTimelineProps) {
  const yearSpan = getTimelineYearSpanFromMarkers(markers);

  if (markers.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        Add lab panels or interventions to build your timeline.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {yearSpan && (
        <div className="flex justify-between font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          <span>{yearSpan.start}</span>
          {yearSpan.end !== yearSpan.start && <span>{yearSpan.end}</span>}
        </div>
      )}

      <div className="mb-2 flex flex-wrap justify-center gap-4 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full border-2 border-amber-400/80 bg-amber-400/30" />
          Lab panel
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full border-2 border-violet-400/80 bg-violet-400/40" />
          Intervention
        </span>
      </div>

      <div className="relative px-2 pt-2 pb-12">
        <div className="absolute left-2 right-2 top-5 h-px bg-white/10" aria-hidden />

        <div className="relative min-h-[72px]">
          {markers.map((marker) => {
            const id = getMarkerId(marker);
            const dateKey = getMarkerDateKey(marker);
            const label = formatChartDate(dateKey);
            const isPanel = marker.kind === "panel";
            const selected =
              isPanel
                ? selection?.kind === "panel" && selection.sessionId === id
                : selection?.kind === "intervention" && selection.interventionId === id;

            const topOffset = isPanel ? "top-0" : "top-8";

            return (
              <button
                key={`${marker.kind}-${id}`}
                type="button"
                onClick={() =>
                  onSelect(
                    isPanel
                      ? { kind: "panel", sessionId: id }
                      : { kind: "intervention", interventionId: id }
                  )
                }
                className={cn(
                  "absolute flex -translate-x-1/2 flex-col items-center gap-1 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50",
                  topOffset
                )}
                style={{ left: `${isPanel ? marker.panel.positionPercent : marker.positionPercent}%` }}
                aria-pressed={selected}
              >
                <span
                  className={cn(
                    "relative z-10 block h-3.5 w-3.5 rounded-full border-2 transition-all",
                    selected && isPanel && "scale-125 border-teal-400 bg-teal-500 shadow-[0_0_12px_rgba(45,212,191,0.45)]",
                    selected && !isPanel && "scale-125 border-violet-300 bg-violet-500 shadow-[0_0_12px_rgba(167,139,250,0.4)]",
                    !selected &&
                      isPanel &&
                      (marker.panel.hasAbnormal
                        ? "border-amber-400/80 bg-amber-400/30"
                        : "border-white/25 bg-white/10"),
                    !selected && !isPanel && "border-violet-400/70 bg-violet-500/35"
                  )}
                />
                <span
                  className={cn(
                    "max-w-[88px] truncate font-mono text-[9px]",
                    selected ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {label}
                </span>
                {isPanel && marker.panel.hasAbnormal && (
                  <span className="text-[8px] text-amber-300/80">{marker.panel.abnormalCount}↑↓</span>
                )}
                {!isPanel && (
                  <span className="max-w-[100px] truncate text-[8px] text-violet-300/90">
                    {marker.intervention.name}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-center text-[10px] text-muted-foreground">
        Amber = lab draw · Violet = intervention start
      </p>
    </div>
  );
}
