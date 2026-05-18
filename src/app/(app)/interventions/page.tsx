import { AppShell } from "@/components/layout/app-shell";
import { InterventionsDashboard } from "@/components/interventions/interventions-dashboard";

export default function InterventionsPage() {
  return (
    <AppShell title="Interventions" subtitle="Supplements, medications & protocols">
      <InterventionsDashboard />
    </AppShell>
  );
}
