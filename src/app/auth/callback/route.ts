import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_NEXT_COOKIE } from "@/lib/auth/constants";
import { canonicalAuthOrigin } from "@/lib/auth/redirect";
import { createClient } from "@/lib/supabase/server";

function safeNextPath(value: string | null | undefined): string {
  if (!value?.startsWith("/") || value.startsWith("/login")) return "/";
  return value;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const origin = canonicalAuthOrigin(request);
  const code = searchParams.get("code");
  const jar = await cookies();
  const next = safeNextPath(
    searchParams.get("next") ?? jar.get(AUTH_NEXT_COOKIE)?.value ?? "/"
  );
  jar.set(AUTH_NEXT_COOKIE, "", { path: "/", maxAge: 0 });

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
