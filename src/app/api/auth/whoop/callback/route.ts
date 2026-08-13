import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  WHOOP_ACCESS_COOKIE,
  WHOOP_EXPIRES_COOKIE,
  WHOOP_REFRESH_COOKIE,
  WHOOP_STATE_COOKIE,
} from "@/lib/auth/constants";
import {
  exchangeWhoopAuthorizationCode,
  getWhoopRedirectUri,
  resolveAppOrigin,
} from "@/lib/auth/whoop-oauth";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { upsertWhoopConnection } from "@/lib/whoop/connection";
import { fetchWhoopProfile } from "@/lib/whoop/client";

function errorRedirect(origin: string, message: string) {
  const url = new URL("/wearables", origin);
  url.searchParams.set("whoop", "error");
  url.searchParams.set("message", message.slice(0, 300));
  return NextResponse.redirect(url);
}

export async function GET(request: Request) {
  const origin = resolveAppOrigin(request);
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const oauthError = searchParams.get("error");
  const oauthDescription = searchParams.get("error_description");

  if (oauthError) {
    return errorRedirect(
      origin,
      oauthDescription ?? oauthError
    );
  }

  if (!code || !state) {
    return errorRedirect(origin, "missing_code_or_state");
  }

  const jar = await cookies();
  const savedState = jar.get(WHOOP_STATE_COOKIE)?.value;

  jar.delete(WHOOP_STATE_COOKIE);

  if (!savedState || savedState !== state) {
    return errorRedirect(
      origin,
      "invalid_state — confirm the WHOOP dashboard redirect URI is https://pulsecheck.space/api/auth/whoop/callback"
    );
  }

  const redirectUri = getWhoopRedirectUri(origin);
  const result = await exchangeWhoopAuthorizationCode(code, redirectUri);

  if (!result.ok) {
    return errorRedirect(origin, `token_exchange: ${result.error}`);
  }

  const expiresIn = result.expires_in ?? 3600;
  const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();
  const refreshToken = result.refresh_token;
  if (!refreshToken) {
    return errorRedirect(origin, "token_exchange: missing refresh token — enable the offline scope");
  }

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const profile = await fetchWhoopProfile(result.access_token);
      await upsertWhoopConnection(
        supabase,
        user.id,
        {
          accessToken: result.access_token,
          refreshToken,
          expiresAt,
        },
        profile
      );
    }
  }

  const res = NextResponse.redirect(new URL("/wearables?whoop=connected", origin));
  const secure = process.env.NODE_ENV === "production";

  res.cookies.set(WHOOP_ACCESS_COOKIE, result.access_token, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: expiresIn,
  });
  res.cookies.set(WHOOP_REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  res.cookies.set(WHOOP_EXPIRES_COOKIE, expiresAt, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: expiresIn,
  });

  return res;
}
