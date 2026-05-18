import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { BiomarkerDashboard } from "@/components/dashboard/biomarker-dashboard";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function BiomarkersPage() {
  return (
    <AppShell title="Biomarkers" subtitle="Longitudinal bloodwork intelligence">
      <div className="mb-6 flex items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground">
          Explore trends, reference ranges, and panel history. Click any marker for the full chart.
        </p>
        <Link
          href="/upload"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "shrink-0 text-xs")}
        >
          Upload report
        </Link>
      </div>
      <BiomarkerDashboard />
    </AppShell>
  );
}
