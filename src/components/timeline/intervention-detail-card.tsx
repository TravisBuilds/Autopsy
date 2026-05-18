"use client";

import Link from "next/link";
import { Pill } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatTimelineDate, normalizeSessionDate } from "@/lib/biomarkers/dates";
import {
  formatInterventionSince,
  formatInterventionSummary,
  interventionTypeLabel,
  isInterventionActive,
} from "@/lib/interventions/format";
import type { Intervention } from "@/types/health";

interface InterventionDetailCardProps {
  intervention: Intervention | null;
}

export function InterventionDetailCard({ intervention }: InterventionDetailCardProps) {
  if (!intervention) {
    return (
      <div className="rounded-xl border border-dashed border-white/10 px-6 py-12 text-center text-sm text-muted-foreground">
        Select an intervention marker on the timeline, or{" "}
        <Link href="/interventions" className="text-teal-400 hover:underline">
          add one
        </Link>
        .
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={intervention.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-5"
      >
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-500/15">
            <Pill className="h-5 w-5 text-violet-300" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-wider text-violet-300/80">Intervention</p>
            <h3 className="text-lg font-medium">{intervention.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {interventionTypeLabel(intervention.type)} · {formatInterventionSummary(intervention)}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Started {formatInterventionSince(intervention)}
              {intervention.endDate &&
                ` · Ended ${formatTimelineDate(normalizeSessionDate(intervention.endDate))}`}
            </p>
            {intervention.notes && (
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{intervention.notes}</p>
            )}
            <p className="mt-3 text-[10px] text-muted-foreground">
              Status: {isInterventionActive(intervention) ? "Active" : "Inactive / ended"}
            </p>
            <Link
              href="/interventions"
              className="mt-4 inline-block text-xs text-teal-400 hover:underline"
            >
              Edit in Interventions →
            </Link>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
