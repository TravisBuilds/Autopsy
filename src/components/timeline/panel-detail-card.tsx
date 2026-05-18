"use client";

import { useMemo, useState } from "react";
import { FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { flagShort, referenceStatusLabel } from "@/lib/biomarkers/reference-labels";
import { formatPanelTitle } from "@/lib/biomarkers/session-history";
import {
  flagGlyph,
  sortPanelReadings,
  type TimelinePanel,
} from "@/lib/biomarkers/timeline-panels";
import { formatTimelineDate, normalizeSessionDate } from "@/lib/biomarkers/dates";
import { cn } from "@/lib/utils";
import type { SessionReading } from "@/types/ingestion";

interface PanelDetailCardProps {
  panel: TimelinePanel | null;
  onSelectMarker: (markerId: string) => void;
}

export function PanelDetailCard({ panel, onSelectMarker }: PanelDetailCardProps) {
  const [flaggedOnly, setFlaggedOnly] = useState(true);

  const readings = useMemo(() => {
    if (!panel) return [];
    return sortPanelReadings(panel.session.readings ?? [], flaggedOnly);
  }, [panel, flaggedOnly]);

  if (!panel) {
    return (
      <div className="rounded-xl border border-dashed border-white/10 px-6 py-12 text-center text-sm text-muted-foreground">
        Select a panel on the timeline above to view its markers.
      </div>
    );
  }

  const { session, abnormalCount, totalMarkers } = panel;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={session.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden rounded-xl border border-white/[0.08] bg-card/50"
      >
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/[0.06] px-5 py-4">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-500/10">
              <FileText className="h-5 w-5 text-teal-400" />
            </div>
            <div>
              <p className="text-sm font-medium">
                {formatTimelineDate(normalizeSessionDate(session.date))}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">{formatPanelTitle(session)}</p>
              <p className="mt-2 text-[10px] text-muted-foreground">
                {totalMarkers} markers ·{" "}
                <span className={abnormalCount > 0 ? "text-amber-300/90" : ""}>
                  {abnormalCount} outside lab reference
                </span>
              </p>
            </div>
          </div>

          <div className="flex rounded-lg border border-white/[0.08] p-0.5 text-[10px]">
            <FilterToggle active={flaggedOnly} onClick={() => setFlaggedOnly(true)}>
              Flagged only
            </FilterToggle>
            <FilterToggle active={!flaggedOnly} onClick={() => setFlaggedOnly(false)}>
              All markers
            </FilterToggle>
          </div>
        </div>

        {readings.length === 0 ? (
          <p className="px-5 py-8 text-center text-xs text-muted-foreground">
            {flaggedOnly
              ? "No markers outside lab reference on this panel."
              : "No marker data for this panel."}
          </p>
        ) : (
          <ul className="divide-y divide-white/[0.04]">
            {readings.map((reading) => (
              <MarkerRow key={reading.markerId} reading={reading} onSelect={onSelectMarker} />
            ))}
          </ul>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

function FilterToggle({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md px-2.5 py-1 transition",
        active ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

function MarkerRow({
  reading,
  onSelect,
}: {
  reading: SessionReading;
  onSelect: (markerId: string) => void;
}) {
  const inRange = reading.flag === "normal";

  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(reading.markerId)}
        className="flex w-full items-center gap-3 px-5 py-3 text-left transition hover:bg-white/[0.03]"
      >
        <span
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded font-mono text-xs",
            inRange ? "bg-white/5 text-muted-foreground" : "bg-amber-500/15 text-amber-300"
          )}
        >
          {flagGlyph(reading.flag)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{reading.markerName}</p>
          <p className="text-[10px] text-muted-foreground">
            {referenceStatusLabel(
              inRange,
              reading.value,
              reading.referenceLow,
              reading.referenceHigh
            )}
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-sm tabular-nums">
            {reading.value}{" "}
            <span className="text-xs text-muted-foreground">{reading.unit}</span>
          </p>
          <p className="text-[10px] text-muted-foreground">{flagShort(reading.flag)}</p>
        </div>
      </button>
    </li>
  );
}
