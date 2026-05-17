import { TimelinePreview } from "@/components/dashboard/timeline-preview";
import { AppShell } from "@/components/layout/app-shell";
import { mockTimeline } from "@/lib/mock-data";

export default function TimelinePage() {
  return (
    <AppShell title="Timeline" subtitle="Longitudinal biological history">
      <div className="rounded-2xl border border-white/[0.06] bg-card/40 p-8 backdrop-blur-xl">
        <p className="mb-8 font-mono text-xs text-muted-foreground">2023 ───────────────────────────── 2026</p>
        <TimelinePreview events={mockTimeline} />
      </div>
    </AppShell>
  );
}
