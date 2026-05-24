import type { GenomeProfile } from "@/types/genome";

export async function fetchGenomeProfile(): Promise<GenomeProfile> {
  const res = await fetch("/api/genome/variants", {
    credentials: "include",
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `Failed to load genome profile (${res.status})`);
  }

  return res.json() as Promise<GenomeProfile>;
}

export async function importGenomeJson(input: {
  file: File;
}): Promise<GenomeProfile> {
  const formData = new FormData();
  formData.set("file", input.file);

  const res = await fetch("/api/genome/import", {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `Genome import failed (${res.status})`);
  }

  return res.json() as Promise<GenomeProfile>;
}
