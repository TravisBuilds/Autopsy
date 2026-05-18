import { NextResponse } from "next/server";
import { rowToIntervention, rowToTestSession } from "@/lib/health/db-mappers";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [sessionsRes, interventionsRes] = await Promise.all([
    supabase
      .from("test_sessions")
      .select("*")
      .eq("user_id", user.id)
      .order("session_date", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("interventions")
      .select("*")
      .eq("user_id", user.id)
      .order("start_date", { ascending: false }),
  ]);

  if (sessionsRes.error) {
    return NextResponse.json({ error: sessionsRes.error.message }, { status: 500 });
  }
  if (interventionsRes.error) {
    return NextResponse.json({ error: interventionsRes.error.message }, { status: 500 });
  }

  return NextResponse.json({
    testSessions: (sessionsRes.data ?? []).map(rowToTestSession),
    interventions: (interventionsRes.data ?? []).map(rowToIntervention),
  });
}
