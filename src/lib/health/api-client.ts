import type { Intervention } from "@/types/health";
import type { ParsedBiomarker, TestSession } from "@/types/ingestion";
import type { InterventionInput } from "@/lib/interventions/format";

export interface HealthSyncPayload {
  testSessions: TestSession[];
  interventions: Intervention[];
}

export async function fetchHealthSync(): Promise<HealthSyncPayload> {
  const res = await fetch("/api/health/sync", { credentials: "include" });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `Sync failed (${res.status})`);
  }
  return res.json() as Promise<HealthSyncPayload>;
}

export async function createTestSession(input: {
  biomarkers: ParsedBiomarker[];
  sessionDate: string;
  labName?: string;
  sourceFileName?: string;
  file?: File;
}): Promise<TestSession> {
  const formData = new FormData();
  formData.set(
    "metadata",
    JSON.stringify({
      sessionDate: input.sessionDate,
      labName: input.labName,
      sourceFileName: input.sourceFileName,
      biomarkers: input.biomarkers,
    })
  );
  if (input.file) {
    formData.set("file", input.file);
  }

  const res = await fetch("/api/health/sessions", {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `Upload failed (${res.status})`);
  }

  return res.json() as Promise<TestSession>;
}

export async function pushLocalHealthData(payload: HealthSyncPayload): Promise<void> {
  const res = await fetch("/api/health/migrate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `Migration failed (${res.status})`);
  }
}

export async function createInterventionApi(input: InterventionInput): Promise<Intervention> {
  const res = await fetch("/api/health/interventions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    credentials: "include",
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? "Failed to create intervention");
  }
  return res.json() as Promise<Intervention>;
}

export async function updateInterventionApi(
  id: string,
  input: InterventionInput
): Promise<Intervention> {
  const res = await fetch(`/api/health/interventions/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    credentials: "include",
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? "Failed to update intervention");
  }
  return res.json() as Promise<Intervention>;
}

export async function deleteInterventionApi(id: string): Promise<void> {
  const res = await fetch(`/api/health/interventions/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? "Failed to delete intervention");
  }
}

export async function deleteTestSessionApi(id: string): Promise<void> {
  const res = await fetch(`/api/health/sessions/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? "Failed to delete panel");
  }
}

export async function clearHealthDataApi(): Promise<void> {
  const res = await fetch("/api/health/clear", {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to clear data");
}
