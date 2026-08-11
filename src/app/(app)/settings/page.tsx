import { AppShell } from "@/components/layout/app-shell";
import { AccountSettings } from "@/components/settings/account-settings";

export default function SettingsPage() {
  return (
    <AppShell title="Account" subtitle="Password and session">
      <AccountSettings />
    </AppShell>
  );
}
