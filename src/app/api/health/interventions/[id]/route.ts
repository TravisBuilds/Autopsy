import { NextResponse } from "next/server";
import { normalizeSessionDate } from "@/lib/biomarkers/dates";
import { rowToIntervention } from "@/lib/health/db-mappers";
import type { InterventionInput } from "@/lib/interventions/format";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const input = (await request.json()) as InterventionInput;

  const { data, error } = await supabase
    .from("interventions")
    .update({
      name: input.name,
      type: input.type,
      dosage: input.dosage ?? null,
      frequency: input.frequency ?? null,
      start_date: normalizeSessionDate(input.startDate),
      end_date: input.endDate ? normalizeSessionDate(input.endDate) : null,
      notes: input.notes ?? null,
      active: input.active,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(rowToIntervention(data));
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase
    .from("interventions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
