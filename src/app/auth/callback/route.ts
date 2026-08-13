import { NextResponse } from "next/server";
import { resolveAppOriginFromRequest } from "@/lib/auth/redirect";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const origin = resolveAppOriginFromRequest(request);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next") ?? "/";
  const next =
    nextParam.startsWith("/") && !nextParam.startsWith("/login") ? nextParam : "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  const fail = new URL(`${origin}/login`);
  fail.searchParams.set("error", "auth_callback");
  return NextResponse.redirect(fail);
}
