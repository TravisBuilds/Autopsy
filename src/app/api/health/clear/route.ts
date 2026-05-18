import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const BUCKET = "lab-pdfs";

export async function DELETE() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: sessions } = await supabase
    .from("test_sessions")
    .select("storage_path")
    .eq("user_id", user.id);

  const paths = ((sessions ?? []) as { storage_path: string | null }[])
    .map((s) => s.storage_path)
    .filter((p): p is string => Boolean(p));

  if (paths.length > 0) {
    await supabase.storage.from(BUCKET).remove(paths);
  }

  await supabase.from("test_sessions").delete().eq("user_id", user.id);
  await supabase.from("interventions").delete().eq("user_id", user.id);

  return NextResponse.json({ ok: true });
}
