import { NextResponse } from "next/server";
import { normalizeSessionDate } from "@/lib/biomarkers/dates";
import { rowToIntervention } from "@/lib/health/db-mappers";
import type { InterventionInput } from "@/lib/interventions/format";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const input = (await request.json()) as InterventionInput;
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("interventions")
    .insert({
      user_id: user.id,
      name: input.name,
      type: input.type,
      dosage: input.dosage ?? null,
      frequency: input.frequency ?? null,
      start_date: normalizeSessionDate(input.startDate),
      end_date: input.endDate ? normalizeSessionDate(input.endDate) : null,
      notes: input.notes ?? null,
      active: input.active,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(rowToIntervention(data));
}
