import Link from "next/link";
import { Upload } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { HealthCard } from "@/components/cards/health-card";

export default function UploadPage() {
  return (
    <AppShell title="Upload" subtitle="Ingest lab reports & diagnostics">
      <HealthCard className="flex min-h-[320px] flex-col items-center justify-center border-dashed border-white/[0.12] text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500/10 ring-1 ring-teal-500/20">
          <Upload className="h-6 w-6 text-teal-400" />
        </div>
        <h3 className="mt-4 text-lg font-medium">Upload blood test PDF</h3>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Drop LifeLabs-style reports. Parsing pipeline extracts biomarkers, normalizes units, and
          updates your timeline.
        </p>
        <Button className="mt-6" disabled>
          Coming in Phase 2
        </Button>
        <p className="mt-4 text-xs text-muted-foreground">
          <Link href="/biomarkers" className="text-teal-400 hover:underline">
            Preview biomarker dashboard →
          </Link>
        </p>
      </HealthCard>
    </AppShell>
  );
}
