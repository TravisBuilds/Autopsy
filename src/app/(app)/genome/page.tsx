import { AppShell } from "@/components/layout/app-shell";
import { HealthCard } from "@/components/cards/health-card";

export default function GenomePage() {
  return (
    <AppShell title="Genome" subtitle="Whole genome sequencing insights">
      <HealthCard>
        <p className="text-sm text-muted-foreground">
          Interpreted variants (APOE, BRCA, CYP450) and pharmacogenomics dashboards will live here.
          Raw WGS files remain in user-controlled external storage.
        </p>
      </HealthCard>
    </AppShell>
  );
}
