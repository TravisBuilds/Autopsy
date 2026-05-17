import { AppShell } from "@/components/layout/app-shell";
import { HomeDashboard } from "@/components/dashboard/home-dashboard";

export default function HomePage() {
  return (
    <AppShell title="Command Center" subtitle="Biological snapshot · May 17, 2026">
      <HomeDashboard />
    </AppShell>
  );
}
