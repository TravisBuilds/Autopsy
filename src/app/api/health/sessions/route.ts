import { NextResponse } from "next/server";
import { normalizeSessionDate } from "@/lib/biomarkers/dates";
import { rowToTestSession } from "@/lib/health/db-mappers";
import { toSessionReadings } from "@/lib/health/readings";
import { createClient } from "@/lib/supabase/server";
import type { ParsedBiomarker } from "@/types/ingestion";

const BUCKET = "lab-pdfs";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const metadataRaw = formData.get("metadata");
  const file = formData.get("file");

  if (typeof metadataRaw !== "string") {
    return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
  }

  let metadata: {
    sessionDate: string;
    labName?: string;
    sourceFileName?: string;
    biomarkers: ParsedBiomarker[];
  };

  try {
    metadata = JSON.parse(metadataRaw) as typeof metadata;
  } catch {
    return NextResponse.json({ error: "Invalid metadata JSON" }, { status: 400 });
  }

  if (!metadata.sessionDate || !Array.isArray(metadata.biomarkers)) {
    return NextResponse.json({ error: "Invalid session payload" }, { status: 400 });
  }

  const sessionId = crypto.randomUUID();
  const readings = toSessionReadings(metadata.biomarkers);
  const normalizedDate = normalizeSessionDate(metadata.sessionDate);

  let storagePath: string | null = null;
  if (file instanceof File && file.size > 0) {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    storagePath = `${user.id}/${sessionId}/${safeName}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, buffer, {
        contentType: file.type || "application/pdf",
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }
  }

  const { data, error } = await supabase
    .from("test_sessions")
    .insert({
      id: sessionId,
      user_id: user.id,
      session_date: normalizedDate,
      lab_name: metadata.labName ?? null,
      source_file_name: metadata.sourceFileName ?? null,
      storage_path: storagePath,
      biomarker_count: readings.length,
      readings,
    })
    .select()
    .single();

  if (error) {
    if (storagePath) {
      await supabase.storage.from(BUCKET).remove([storagePath]);
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(rowToTestSession(data));
}
