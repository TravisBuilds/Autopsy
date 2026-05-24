import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const BUCKET = "lab-pdfs";

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

  const { data: session, error: fetchError } = await supabase
    .from("test_sessions")
    .select("storage_path")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  if (!session) {
    return NextResponse.json({ error: "Panel not found" }, { status: 404 });
  }

  if (session.storage_path) {
    await supabase.storage.from(BUCKET).remove([session.storage_path]);
  }

  const { error: deleteError } = await supabase
    .from("test_sessions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
