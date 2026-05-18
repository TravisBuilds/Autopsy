import type { Intervention } from "@/types/health";
import type { SessionReading, TestSession } from "@/types/ingestion";
import type { Database } from "@/lib/supabase/database.types";

type TestSessionRow = Database["public"]["Tables"]["test_sessions"]["Row"];
type InterventionRow = Database["public"]["Tables"]["interventions"]["Row"];

export function rowToTestSession(row: TestSessionRow): TestSession {
  return {
    id: row.id,
    date: row.session_date,
    labName: row.lab_name ?? undefined,
    sourceFileName: row.source_file_name ?? undefined,
    biomarkerCount: row.biomarker_count,
    createdAt: row.created_at,
    readings: (row.readings as unknown as SessionReading[]) ?? [],
  };
}

export function rowToIntervention(row: InterventionRow): Intervention {
  return {
    id: row.id,
    name: row.name,
    type: row.type as Intervention["type"],
    dosage: row.dosage ?? undefined,
    frequency: row.frequency ?? undefined,
    startDate: row.start_date,
    endDate: row.end_date ?? undefined,
    notes: row.notes ?? undefined,
    active: row.active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function interventionToRow(
  userId: string,
  input: Omit<Intervention, "id" | "createdAt" | "updatedAt"> & { id?: string }
): Database["public"]["Tables"]["interventions"]["Insert"] {
  return {
    id: input.id,
    user_id: userId,
    name: input.name,
    type: input.type,
    dosage: input.dosage ?? null,
    frequency: input.frequency ?? null,
    start_date: input.startDate,
    end_date: input.endDate ?? null,
    notes: input.notes ?? null,
    active: input.active,
  };
}
