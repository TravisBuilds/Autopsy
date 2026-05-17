import { AppShell } from "@/components/layout/app-shell";
import { HealthCard } from "@/components/cards/health-card";

export default function ImagingPage() {
  return (
    <AppShell title="Imaging" subtitle="MRI, Dexa & structural findings">
      <HealthCard>
        <p className="text-sm text-muted-foreground">
          Prenuvo MRI sessions, incidental findings, and progression tracking — Phase 6.
        </p>
      </HealthCard>
    </AppShell>
  );
}
