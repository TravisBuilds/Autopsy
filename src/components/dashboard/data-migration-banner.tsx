"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { hasLegacySessionsWithoutReadings, useHealthStore } from "@/stores/health-store";

export function DataMigrationBanner() {
  const sessions = useHealthStore((s) => s.testSessions);
  const clearAllData = useHealthStore((s) => s.clearAllData);

  if (!hasLegacySessionsWithoutReadings(sessions)) return null;

  return (
    <div className="mb-6 flex gap-3 rounded-xl border border-amber-500/25 bg-amber-500/10 p-4">
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-amber-100">Re-upload needed for full history</p>
        <p className="mt-1 text-xs leading-relaxed text-amber-200/80">
          Your {sessions.length} earlier uploads were saved before multi-panel tracking was added.
          Only the latest values were kept. Clear data and re-upload your PDFs (one per panel date)
          to build correct longitudinal charts.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-3 border-amber-500/30 text-xs text-amber-100 hover:bg-amber-500/10"
          onClick={() => {
            if (confirm("Clear all uploaded biomarker data? You can re-upload your PDFs afterward.")) {
              clearAllData();
            }
          }}
        >
          Clear uploaded data
        </Button>
      </div>
    </div>
  );
}
