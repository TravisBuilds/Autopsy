"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LabParseResult } from "@/types/ingestion";

const flagStyles: Record<string, string> = {
  high: "text-amber-400 border-amber-400/30 bg-amber-400/10",
  low: "text-sky-400 border-sky-400/30 bg-sky-400/10",
  normal: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
  critical: "text-red-400 border-red-400/30 bg-red-400/10",
};

interface ParseReviewProps {
  result: LabParseResult;
  fileName?: string;
  onConfirm: (sessionDate: string) => void;
  onCancel: () => void;
  saving?: boolean;
}

export function ParseReview({
  result,
  fileName,
  onConfirm,
  onCancel,
  saving,
}: ParseReviewProps) {
  const [sessionDate, setSessionDate] = useState(
    result.sessionDate ?? new Date().toISOString().slice(0, 10)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 rounded-xl border border-white/[0.06] bg-card/40 p-4">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Review & confirm</p>
          <p className="mt-1 text-sm">
            {result.biomarkers.length} markers detected
            {fileName && (
              <span className="text-muted-foreground"> · {fileName}</span>
            )}
          </p>
          {result.labName && (
            <p className="mt-0.5 text-xs text-muted-foreground">Lab: {result.labName}</p>
          )}
        </div>
        <label className="flex flex-col gap-1">
          <span className="text-[10px] text-muted-foreground">Panel date (collection / service date)</span>
          <input
            type="date"
            value={sessionDate}
            onChange={(e) => setSessionDate(e.target.value)}
            className="rounded-lg border border-white/10 bg-background/80 px-3 py-1.5 font-mono text-sm outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/30"
          />
        </label>
      </div>
      <p className="text-[10px] text-muted-foreground">
        Use the collection / service date from your report — not the PDF footer date. Each panel needs its own date for trends.
      </p>

      {result.parseErrors.length > 0 && (
        <div className="flex gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-200">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <ul className="list-inside list-disc space-y-1">
            {result.parseErrors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-white/[0.06]">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] bg-white/[0.02] text-[10px] uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 font-medium">Marker</th>
              <th className="px-4 py-3 font-medium">Value</th>
              <th className="px-4 py-3 font-medium">Reference</th>
              <th className="px-4 py-3 font-medium">Flag</th>
              <th className="hidden px-4 py-3 font-medium sm:table-cell">Category</th>
            </tr>
          </thead>
          <tbody>
            {result.biomarkers.map((row) => (
              <tr
                key={`${row.markerName}-${row.value}`}
                className="border-b border-white/[0.04] transition hover:bg-white/[0.02]"
              >
                <td className="px-4 py-2.5 font-medium">{row.markerName}</td>
                <td className="px-4 py-2.5 font-mono tabular-nums">
                  {row.value} <span className="text-muted-foreground">{row.unit}</span>
                </td>
                <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                  {row.referenceLow}–{row.referenceHigh}
                </td>
                <td className="px-4 py-2.5">
                  <Badge variant="outline" className={cn("text-[10px] capitalize", flagStyles[row.flag])}>
                    {row.flag}
                  </Badge>
                </td>
                <td className="hidden px-4 py-2.5 text-xs capitalize text-muted-foreground sm:table-cell">
                  {row.category}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button
          onClick={() => onConfirm(sessionDate)}
          disabled={saving || result.biomarkers.length === 0}
          className="bg-teal-600 text-white hover:bg-teal-500"
        >
          {saving ? "Saving…" : "Confirm & update timeline"}
        </Button>
      </div>
    </div>
  );
}
