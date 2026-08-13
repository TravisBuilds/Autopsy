import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_NEXT_COOKIE } from "@/lib/auth/constants";
import { authCallbackUrlForRequest } from "@/lib/auth/redirect";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export async function POST(request: Request) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Supabase is not configured" }, { status: 503 });
    }

    const body = (await request.json()) as { email?: string; origin?: string };
    const email = body.email?.trim();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const jar = await cookies();
    jar.set(AUTH_NEXT_COOKIE, "/auth/reset-password", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    const redirectTo = authCallbackUrlForRequest(
      request,
      "/auth/reset-password",
      body.origin
    );
    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

    if (error) {
      const rateLimited = /rate.?limit|too many/i.test(error.message);
      return NextResponse.json(
        {
          error: rateLimited
            ? "Too many reset emails. Wait about an hour, or raise the limit in Supabase → Authentication → Rate Limits (custom SMTP required)."
            : error.message,
        },
        { status: rateLimited ? 429 : 400 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("forgot-password:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not send reset email" },
      { status: 500 }
    );
  }
}
