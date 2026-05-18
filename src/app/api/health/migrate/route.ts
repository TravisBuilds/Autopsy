import { NextResponse } from "next/server";
import { normalizeSessionDate } from "@/lib/biomarkers/dates";
import { createClient } from "@/lib/supabase/server";
import type { Intervention } from "@/types/health";
import type { TestSession } from "@/types/ingestion";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    testSessions?: TestSession[];
    interventions?: Intervention[];
  };

  const sessions = body.testSessions ?? [];
  const interventions = body.interventions ?? [];

  const [{ count: sessionCount }, { count: interventionCount }] = await Promise.all([
    supabase
      .from("test_sessions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("interventions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id),
  ]);

  const migratedSessions: string[] = [];
  const migratedInterventions: string[] = [];

  if (sessions.length > 0 && (sessionCount ?? 0) === 0) {
    const rows = sessions.map((s) => ({
      id: s.id,
      user_id: user.id,
      session_date: normalizeSessionDate(s.date),
      lab_name: s.labName ?? null,
      source_file_name: s.sourceFileName ?? null,
      storage_path: null,
      biomarker_count: s.biomarkerCount ?? s.readings?.length ?? 0,
      readings: s.readings ?? [],
      created_at: s.createdAt,
    }));

    const { error } = await supabase.from("test_sessions").insert(rows);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    migratedSessions.push(...sessions.map((s) => s.id));
  }

  if (interventions.length > 0 && (interventionCount ?? 0) === 0) {
    const rows = interventions.map((i) => ({
      id: i.id,
      user_id: user.id,
      name: i.name,
      type: i.type,
      dosage: i.dosage ?? null,
      frequency: i.frequency ?? null,
      start_date: normalizeSessionDate(i.startDate),
      end_date: i.endDate ? normalizeSessionDate(i.endDate) : null,
      notes: i.notes ?? null,
      active: i.active,
      created_at: i.createdAt,
      updated_at: i.updatedAt,
    }));

    const { error } = await supabase.from("interventions").insert(rows);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    migratedInterventions.push(...interventions.map((i) => i.id));
  }

  return NextResponse.json({
    migrated:
      migratedSessions.length > 0 || migratedInterventions.length > 0,
    sessions: migratedSessions.length,
    interventions: migratedInterventions.length,
  });
}
