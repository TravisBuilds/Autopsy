import { BiomarkerCard } from "@/components/cards/biomarker-card";
import { AppShell } from "@/components/layout/app-shell";
import { mockBiomarkers } from "@/lib/mock-data";

export default function BiomarkersPage() {
  return (
    <AppShell title="Biomarkers" subtitle="Longitudinal bloodwork intelligence">
      <div className="mb-6">
        <p className="text-xs text-muted-foreground">
          Track trends, reference ranges, and flags across panels. Upload pipeline coming in Phase 2.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {mockBiomarkers.map((b, i) => (
          <BiomarkerCard key={b.id} biomarker={b} delay={i * 0.04} expanded />
        ))}
      </div>
    </AppShell>
  );
}
