"use client";

import { useState } from "react";
import { ChevronDown, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SectionHeader } from "@/components/dashboard/section-header";
import { flagShort, referenceStatusLabel } from "@/lib/biomarkers/reference-labels";
import { formatPanelTitle, sortSessionsChronologically } from "@/lib/biomarkers/session-history";
import { formatTimelineDate, normalizeSessionDate } from "@/lib/biomarkers/dates";
import { cn } from "@/lib/utils";
import type { TestSession } from "@/types/ingestion";

interface PanelHistoryListProps {
  sessions: TestSession[];
}

export function PanelHistoryList({ sessions }: PanelHistoryListProps) {
  const sorted = sortSessionsChronologically(sessions).reverse();
  const [expandedId, setExpandedId] = useState<string | null>(sorted[0]?.id ?? null);

  if (sorted.length === 0) return null;

  return (
    <section className="mb-8">
      <SectionHeader
        title="Panel history"
        description={`${sorted.length} lab report${sorted.length !== 1 ? "s" : ""} on record — full chronological archive`}
      />

      <div className="space-y-2">
        {sorted.map((session, i) => {
          const open = expandedId === session.id;
          const readings = session.readings ?? [];

          return (
            <div
              key={session.id}
              className="overflow-hidden rounded-xl border border-white/[0.06] bg-card/40"
            >
              <button
                type="button"
                onClick={() => setExpandedId(open ? null : session.id)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-white/[0.03]"
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
