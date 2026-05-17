"use client";

import Link from "next/link";
import { TimelinePreview } from "@/components/dashboard/timeline-preview";
import { useHasUploadedData, useTimeline } from "@/hooks/use-health-data";

export function TimelineView() {
  const events = useTimeline();
  const hasUploaded = useHasUploadedData();

  return (
    <>
      {!hasUploaded && (
        <p className="mb-6 text-xs text-muted-foreground">
          Demo timeline —{" "}
          <Link href="/upload" className="text-teal-400 hover:underline">
            upload a lab report
          </Link>{" "}
          to build yours.
        </p>
      )}
      <div className="rounded-2xl border border-white/[0.06] bg-card/40 p-8 backdrop-blur-xl">
        <p className="mb-8 font-mono text-xs text-muted-foreground">
          2023 ───────────────────────────── 2026
        </p>
        <TimelinePreview events={events} />
      </div>
    </>
  );
}
