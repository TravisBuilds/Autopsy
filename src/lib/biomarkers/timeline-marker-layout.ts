import {
  getMarkerDateKey,
  getMarkerId,
  type TimelineAxisMarker,
} from "@/lib/biomarkers/timeline-axis";

export interface TimelineMarkerLayout {
  /** Horizontal position on the axis (0–100); unchanged within a same-date cluster */
  leftPercent: number;
  /** Index within a same-date, same-kind cluster (0-based) */
  clusterIndex: number;
  clusterSize: number;
  /** Show the shared date label on this marker */
  showDateLabel: boolean;
  /** Vertical offset below the row baseline so stacked markers share one timeline segment */
  stackOffsetPx: number;
}

/** First row in a cluster (dot + date + label) */
const INTERVENTION_FIRST_ROW_PX = 52;
const PANEL_FIRST_ROW_PX = 48;
/** Additional stacked rows (dot + label only) */
const INTERVENTION_STACK_ROW_PX = 34;
const PANEL_STACK_ROW_PX = 32;

function clusterKey(marker: TimelineAxisMarker): string {
  return `${marker.kind}:${getMarkerDateKey(marker)}`;
}

function basePositionPercent(marker: TimelineAxisMarker): number {
  return marker.kind === "panel" ? marker.panel.positionPercent : marker.positionPercent;
}

function clampPercent(value: number): number {
  return Math.min(98, Math.max(2, value));
}

function stackOffsetPx(index: number, isIntervention: boolean): number {
  if (index === 0) return 0;
  const first = isIntervention ? INTERVENTION_FIRST_ROW_PX : PANEL_FIRST_ROW_PX;
  const step = isIntervention ? INTERVENTION_STACK_ROW_PX : PANEL_STACK_ROW_PX;
  const magnitude = first + (index - 1) * step;
  // Panels label above the axis — stack additional panels upward
  return isIntervention ? magnitude : -magnitude;
}

/**
 * Stacks markers that share a date (and kind) vertically at the same horizontal
 * position so the timeline date is not misrepresented.
 */
export function computeTimelineMarkerLayouts(
  markers: TimelineAxisMarker[]
): Map<string, TimelineMarkerLayout> {
  const groups = new Map<string, TimelineAxisMarker[]>();

  for (const marker of markers) {
    const key = clusterKey(marker);
    const list = groups.get(key) ?? [];
    list.push(marker);
    groups.set(key, list);
  }

  const layouts = new Map<string, TimelineMarkerLayout>();

  for (const group of groups.values()) {
    const sorted = [...group].sort((a, b) =>
      getMarkerId(a).localeCompare(getMarkerId(b))
    );
    const n = sorted.length;
    const base = basePositionPercent(sorted[0]!);
    const isIntervention = sorted[0]!.kind === "intervention";

    sorted.forEach((marker, index) => {
      const id = getMarkerId(marker);
      const mapKey = `${marker.kind}-${id}`;

      layouts.set(mapKey, {
        leftPercent: clampPercent(base),
        clusterIndex: index,
        clusterSize: n,
        showDateLabel: n === 1 || index === 0,
        stackOffsetPx: stackOffsetPx(index, isIntervention),
      });
    });
  }

  return layouts;
}

export function getMaxClusterSizeFromLayouts(
  layouts: Map<string, TimelineMarkerLayout>
): number {
  let max = 1;
  for (const layout of layouts.values()) {
    max = Math.max(max, layout.clusterSize);
  }
  return max;
}

/** Extra space below the axis for stacked interventions */
export function getStackPaddingBelow(
  layouts: Map<string, TimelineMarkerLayout>
): number {
  let max = 0;
  for (const layout of layouts.values()) {
    if (layout.stackOffsetPx > 0) {
      max = Math.max(max, layout.stackOffsetPx);
    }
  }
  return max;
}

/** Extra space above the axis for stacked lab panels */
export function getStackPaddingAbove(
  layouts: Map<string, TimelineMarkerLayout>
): number {
  let max = 0;
  for (const layout of layouts.values()) {
    if (layout.stackOffsetPx < 0) {
      max = Math.max(max, -layout.stackOffsetPx);
    }
  }
  return max;
}
