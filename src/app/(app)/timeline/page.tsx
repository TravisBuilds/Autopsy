import { Suspense } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { TimelineView } from "@/components/dashboard/timeline-view";

function TimelineFallback() {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-card/40 p-12 text-center text-sm text-muted-foreground">
      Loading timeline…
    </div>
  );
}

export default function TimelinePage() {
  return (
    <AppShell title="Timeline" subtitle="Longitudinal biological history">
      <Suspense fallback={<TimelineFallback />}>
        <TimelineView />
      </Suspense>
    </AppShell>
  );
}
