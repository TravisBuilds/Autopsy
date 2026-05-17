import { AppShell } from "@/components/layout/app-shell";
import { TimelineView } from "@/components/dashboard/timeline-view";

export default function TimelinePage() {
  return (
    <AppShell title="Timeline" subtitle="Longitudinal biological history">
      <TimelineView />
    </AppShell>
  );
}
