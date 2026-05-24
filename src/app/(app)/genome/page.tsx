import { AppShell } from "@/components/layout/app-shell";
import { GenomePanel } from "@/components/genome/genome-panel";

export default function GenomePage() {
  return (
    <AppShell title="Genome" subtitle="Whole genome sequencing insights">
      <GenomePanel />
    </AppShell>
  );
}
