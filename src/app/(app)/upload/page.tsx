import { AppShell } from "@/components/layout/app-shell";
import { UploadWorkflow } from "@/components/upload/upload-workflow";

export default function UploadPage() {
  return (
    <AppShell title="Upload" subtitle="Ingest lab reports & diagnostics">
      <UploadWorkflow />
    </AppShell>
  );
}
