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
      "invalid_state — confirm NEXT_PUBLIC_APP_URL matches the URL in your browser and the WHOOP redirect URI"
    );
  }

  const redirectUri = getWhoopRedirectUri(origin);
  const result = await exchangeWhoopAuthorizationCode(code, redirectUri);

  if (!result.ok) {
    return errorRedirect(origin, `token_exchange: ${result.error}`);
  }

  const res = NextResponse.redirect(new URL("/wearables?whoop=connected", origin));
  const secure = process.env.NODE_ENV === "production";
  const maxAge = result.expires_in ?? 3600;

  res.cookies.set(WHOOP_ACCESS_COOKIE, result.access_token, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge,
  });

  if (result.refresh_token) {
    res.cookies.set(WHOOP_REFRESH_COOKIE, result.refresh_token, {
      httpOnly: true,
      sameSite: "lax",
      secure,
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  if (result.expires_in) {
    const expiresAt = new Date(Date.now() + result.expires_in * 1000).toISOString();
    res.cookies.set(WHOOP_EXPIRES_COOKIE, expiresAt, {
      httpOnly: true,
      sameSite: "lax",
      secure,
      path: "/",
      maxAge: result.expires_in,
    });
  }

  return res;
}
