import { WearableCard } from "@/components/cards/wearable-card";
import { AppShell } from "@/components/layout/app-shell";
import { mockWearable } from "@/lib/mock-data";

export default function WearablesPage() {
  return (
    <AppShell title="Wearables" subtitle="WHOOP recovery & strain intelligence">
      <WearableCard data={mockWearable} />
      <p className="mt-6 text-xs text-muted-foreground">
        WHOOP API integration planned for Phase 4.
      </p>
    </AppShell>
  );
}
