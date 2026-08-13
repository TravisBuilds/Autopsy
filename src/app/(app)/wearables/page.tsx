import { Suspense } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { WearablesDashboard } from "@/components/wearables/wearables-dashboard";

export default function WearablesPage() {
  return (
    <AppShell title="Wearables" subtitle="Permanent WHOOP history — reconnect to update, not to start over">
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
        <WearablesDashboard />
      </Suspense>
    </AppShell>
  );
}
