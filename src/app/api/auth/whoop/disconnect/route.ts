import { NextResponse } from "next/server";
import { clearWhoopCookies } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { deleteWhoopConnection } from "@/lib/whoop/connection";

export async function POST() {
  await clearWhoopCookies();

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await deleteWhoopConnection(supabase, user.id);
    }
  }

  return NextResponse.json({ ok: true, keptHistory: true });
}
