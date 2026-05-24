"use client";

import { useMemo, useState } from "react";
import { ChevronDown, FileText, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SectionHeader } from "@/components/dashboard/section-header";
import { flagShort, referenceStatusLabel } from "@/lib/biomarkers/reference-labels";
import {
  dedupeSessionReadings,
  duplicateSessionIds,
  formatPanelTitle,
  sortSessionsChronologically,
} from "@/lib/biomarkers/session-history";
import { formatTimelineDate, normalizeSessionDate } from "@/lib/biomarkers/dates";
import { cn } from "@/lib/utils";
import type { TestSession } from "@/types/ingestion";

interface PanelHistoryListProps {
  sessions: TestSession[];
  onRemove?: (id: string) => Promise<void>;
}

export function PanelHistoryList({ sessions, onRemove }: PanelHistoryListProps) {
  const sorted = useMemo(
    () => sortSessionsChronologically(sessions).reverse(),
    [sessions]
  );
  const duplicateIds = useMemo(() => duplicateSessionIds(sessions), [sessions]);
  const [expandedId, setExpandedId] = useState<string | null>(sorted[0]?.id ?? null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (sorted.length === 0) return null;

  const handleRemove = async (session: TestSession) => {
    const label = formatTimelineDate(normalizeSessionDate(session.date));
    if (
      !confirm(
        `Remove this lab panel from ${label}? This deletes it from your history and cannot be undone.`
      )
    ) {
      return;
    }

    setError(null);
    setRemovingId(session.id);
    try {
      await onRemove?.(session.id);
      if (expandedId === session.id) {
        setExpandedId(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to remove panel");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <section className="mt-10">
      <SectionHeader
        title="Panel history"
        description={`${sorted.length} lab report${sorted.length !== 1 ? "s" : ""} on record — full chronological archive`}
      />

      {error && (
        <p className="mb-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {error}
        </p>
      )}

      <div className="space-y-2">
        {sorted.map((session) => {
          const open = expandedId === session.id;
          const readings = dedupeSessionReadings(session.readings ?? []);
          const isDuplicate = duplicateIds.has(session.id);
          const isRemoving = removingId === session.id;

          return (
            <div
              key={session.id}
              className="overflow-hidden rounded-xl border border-white/[0.06] bg-card/40"
            >
              <div className="flex items-stretch">
                <button
                  type="button"
                  onClick={() => setExpandedId(open ? null : session.id)}
                  className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3 text-left transition hover:bg-white/[0.03]"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-500/10">
                    <FileText className="h-4 w-4 text-teal-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      {formatTimelineDate(normalizeSessionDate(session.date))}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {formatPanelTitle(session)}
                    </p>
                    {isDuplicate && (
                      <p className="mt-0.5 text-[10px] text-amber-400/90">
                        Possible duplicate — same date and file as another panel
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {readings.length} markers
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 text-muted-foreground transition",
                        open && "rotate-180"
                      )}
                    />
                  </div>
                </button>

                {onRemove && (
                  <button
                    type="button"
                    disabled={isRemoving}
                    onClick={() => void handleRemove(session)}
                    className="shrink-0 border-l border-white/[0.06] px-3 text-muted-foreground transition hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                    aria-label="Remove panel"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              <AnimatePresence>
                {open && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="border-t border-white/[0.06]">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-white/[0.02] text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                            <th className="px-4 py-2">Marker</th>
                            <th className="px-4 py-2">Value</th>
                            <th className="px-4 py-2">Lab reference</th>
                          </tr>
                        </thead>
                        <tbody>
                          {readings.map((r) => (
                            <tr
                              key={r.markerId}
                              className="border-t border-white/[0.04] hover:bg-white/[0.02]"
                            >
                              <td className="px-4 py-2 font-medium">{r.markerName}</td>
                              <td className="px-4 py-2 font-mono tabular-nums">
                                {r.value} {r.unit}
                              </td>
                              <td className="px-4 py-2">
                                <span className="text-[10px] text-muted-foreground">
                                  {r.referenceLow}–{r.referenceHigh} {r.unit}
                                </span>
                                <span className="mt-0.5 block text-[10px] text-muted-foreground/80">
                                  {referenceStatusLabel(
                                    r.flag === "normal",
                                    r.value,
                                    r.referenceLow,
                                    r.referenceHigh
                                  )}{" "}
                                  · {flagShort(r.flag)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
