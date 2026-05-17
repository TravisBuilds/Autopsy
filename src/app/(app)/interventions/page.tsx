import { InterventionCard } from "@/components/cards/intervention-card";
import { AppShell } from "@/components/layout/app-shell";
import { mockInterventions } from "@/lib/mock-data";

export default function InterventionsPage() {
  return (
    <AppShell title="Interventions" subtitle="Supplements, medications & protocols">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mockInterventions.map((item, i) => (
          <InterventionCard key={item.id} intervention={item} delay={i * 0.05} />
        ))}
      </div>
    </AppShell>
  );
}
