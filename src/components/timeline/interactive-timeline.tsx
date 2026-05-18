"use client";

import { useMemo } from "react";
import { formatChartDate } from "@/lib/biomarkers/dates";
import {
  getMarkerDateKey,
  getMarkerId,
  getTimelineYearSpanFromMarkers,
  type TimelineAxisMarker,
} from "@/lib/biomarkers/timeline-axis";
import {
  computeTimelineMarkerLayouts,
  getStackPaddingAbove,
  getStackPaddingBelow,
} from "@/lib/biomarkers/timeline-marker-layout";
import { cn } from "@/lib/utils";

/** Matches `top-5` on the axis rule */
const AXIS_TOP_PX = 20;
const DOT_SIZE_PX = 14;
/** Date + optional abnormal badge above panel dots */
const PANEL_LABEL_BLOCK_PX = 28;
const PANEL_ROW_TOP_PX = AXIS_TOP_PX - DOT_SIZE_PX - PANEL_LABEL_BLOCK_PX;
const INTERVENTION_ROW_TOP_PX = 32;

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
  const layouts = useMemo(() => computeTimelineMarkerLayouts(markers), [markers]);
  const stackBelow = useMemo(() => getStackPaddingBelow(layouts), [layouts]);
  const stackAbove = useMemo(() => getStackPaddingAbove(layouts), [layouts]);

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

      <div
        className="relative px-2"
        style={{
          paddingTop: `${20 + stackAbove}px`,
          paddingBottom: `${48 + stackBelow}px`,
        }}
      >
        <div className="absolute left-2 right-2 top-5 h-px bg-white/10" aria-hidden />

        <div
          className="relative"
          style={{ minHeight: `${72 + stackBelow}px` }}
        >
          {markers.map((marker) => {
            const id = getMarkerId(marker);
            const mapKey = `${marker.kind}-${id}`;
            const layout = layouts.get(mapKey);
            const dateKey = getMarkerDateKey(marker);
            const label = formatChartDate(dateKey);
            const isPanel = marker.kind === "panel";
            const selected =
              isPanel
                ? selection?.kind === "panel" && selection.sessionId === id
                : selection?.kind === "intervention" && selection.interventionId === id;

            const stackOffsetPx = layout?.stackOffsetPx ?? 0;
            const rowTopPx = isPanel
              ? PANEL_ROW_TOP_PX + stackOffsetPx
              : INTERVENTION_ROW_TOP_PX + stackOffsetPx;
            const leftPercent =
              layout?.leftPercent ??
              (isPanel ? marker.panel.positionPercent : marker.positionPercent);
            const inCluster = (layout?.clusterSize ?? 1) > 1;
            const showDateLabel = layout?.showDateLabel ?? true;
            const isStackedFollower = inCluster && (layout?.clusterIndex ?? 0) > 0;

            return (
              <button
                key={mapKey}
                type="button"
                onClick={() =>
                  onSelect(
                    isPanel
                      ? { kind: "panel", sessionId: id }
                      : { kind: "intervention", interventionId: id }
                  )
                }
                className={cn(
                  "absolute flex -translate-x-1/2 flex-col items-center gap-0.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50",
                  inCluster && "z-[1] hover:z-10"
                )}
                style={{
                  left: `${leftPercent}%`,
                  top: `${rowTopPx}px`,
                }}
                aria-pressed={selected}
                title={
                  !isPanel && inCluster
                    ? `${marker.intervention.name} · ${label}`
                    : undefined
                }
              >
                {isPanel ? (
                  <>
                    {showDateLabel ? (
                      <span
                        className={cn(
                          "whitespace-nowrap font-mono text-[9px]",
                          selected ? "text-foreground" : "text-muted-foreground",
                          inCluster && "font-medium"
                        )}
                      >
                        {label}
                        {inCluster && layout && (
                          <span className="ml-1 text-[8px] text-amber-400/70">
                            · {layout.clusterSize}
                          </span>
                        )}
                      </span>
                    ) : isStackedFollower ? null : (
                      <span className="h-[13px]" aria-hidden />
                    )}
                    {marker.panel.hasAbnormal && (
                      <span className="whitespace-nowrap text-[8px] text-amber-300/80">
                        {marker.panel.abnormalCount}↑↓
                      </span>
                    )}
                    <span
                      className={cn(
                        "relative z-10 block h-3.5 w-3.5 shrink-0 rounded-full border-2 transition-all",
                        selected &&
                          "scale-125 border-teal-400 bg-teal-500 shadow-[0_0_12px_rgba(45,212,191,0.45)]",
                        !selected &&
                          (marker.panel.hasAbnormal
                            ? "border-amber-400/80 bg-amber-400/30"
                            : "border-white/25 bg-white/10")
                      )}
                    />
                  </>
                ) : (
                  <>
                    <span
                      className={cn(
                        "relative z-10 block h-3.5 w-3.5 shrink-0 rounded-full border-2 transition-all",
                        selected &&
                          "scale-125 border-violet-300 bg-violet-500 shadow-[0_0_12px_rgba(167,139,250,0.4)]",
                        !selected && "border-violet-400/70 bg-violet-500/35"
                      )}
                    />
                    {showDateLabel ? (
                      <span
                        className={cn(
                          "whitespace-nowrap font-mono text-[9px]",
                          selected ? "text-foreground" : "text-muted-foreground",
                          inCluster && "font-medium"
                        )}
                      >
                        {label}
                        {inCluster && layout && (
                          <span className="ml-1 text-[8px] text-violet-400/70">
                            · {layout.clusterSize}
                          </span>
                        )}
                      </span>
                    ) : isStackedFollower ? null : (
                      <span className="h-[13px]" aria-hidden />
                    )}
                    <span
                      className={cn(
                        "max-w-[7rem] text-center text-[8px] leading-tight text-violet-300/90",
                        inCluster ? "whitespace-normal break-words" : "truncate"
                      )}
                    >
                      {marker.intervention.name}
                    </span>
                  </>
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
