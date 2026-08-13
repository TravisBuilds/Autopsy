"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { SectionHeader } from "@/components/dashboard/section-header";
import { formatTimelineDate, normalizeSessionDate } from "@/lib/biomarkers/dates";
import { formatWhoopNumber, recoveryDot, recoveryTone } from "@/lib/whoop/format";
import { cn } from "@/lib/utils";
import type { WearableSnapshot } from "@/types/health";

export function WhoopHistoryList({ days }: { days: WearableSnapshot[] }) {
  const sorted = useMemo(
    () => [...days].sort((a, b) => (a.date < b.date ? 1 : -1)),
    [days]
  );
  const [expandedDate, setExpandedDate] = useState<string | null>(sorted[0]?.date ?? null);

  if (sorted.length === 0) return null;

  return (
    <section>
      <SectionHeader
        title="History"
        description={`${sorted.length} scored ${sorted.length === 1 ? "day" : "days"} on record`}
      />
      <div className="space-y-2">
        {sorted.map((day) => {
          const open = expandedDate === day.date;
          return (
            <div
              key={day.date}
              className="overflow-hidden rounded-xl border border-white/[0.06] bg-card/40"
            >
              <button
                type="button"
                onClick={() => setExpandedDate(open ? null : day.date)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-white/[0.03]"
              >
                <span className={cn("h-2 w-2 shrink-0 rounded-full", recoveryDot(day.recovery))} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">
                    {formatTimelineDate(normalizeSessionDate(day.date))}
                  </p>
                  <p className="truncate font-mono text-[11px] text-muted-foreground">
                    HRV {formatWhoopNumber(day.hrv, { hideZero: true, suffix: " ms" })}
                    {" · "}
                    Strain {formatWhoopNumber(day.strain, { digits: 1, hideZero: true })}
                    {" · "}
                    Sleep {formatWhoopNumber(day.sleepScore, { hideZero: true, suffix: "%" })}
                  </p>
                </div>
                <span
                  className={cn(
                    "font-mono text-lg font-light tabular-nums",
                    recoveryTone(day.recovery)
                  )}
                >
                  {day.recovery}
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                    open && "rotate-180"
                  )}
                />
              </button>
              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-2 gap-3 border-t border-white/[0.06] px-4 py-3 sm:grid-cols-5">
                      <HistoryMetric label="Recovery" value={`${day.recovery}%`} />
                      <HistoryMetric
                        label="HRV"
                        value={formatWhoopNumber(day.hrv, { hideZero: true, suffix: " ms" })}
                      />
                      <HistoryMetric
                        label="Resting HR"
                        value={formatWhoopNumber(day.restingHr, { hideZero: true, suffix: " bpm" })}
                      />
                      <HistoryMetric
                        label="Sleep"
                        value={formatWhoopNumber(day.sleepScore, { hideZero: true, suffix: "%" })}
                      />
                      <HistoryMetric
                        label="Strain"
                        value={formatWhoopNumber(day.strain, { digits: 1, hideZero: true })}
                      />
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

function HistoryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-mono text-sm tabular-nums">{value}</p>
    </div>
  );
}
