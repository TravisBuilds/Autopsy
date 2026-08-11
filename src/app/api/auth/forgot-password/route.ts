import { NextResponse } from "next/server";
import { authCallbackUrlForRequest } from "@/lib/auth/redirect";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 503 });
  }

  const body = (await request.json()) as { email?: string };
  const email = body.email?.trim();
  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const redirectTo = authCallbackUrlForRequest(request, "/auth/reset-password");
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
