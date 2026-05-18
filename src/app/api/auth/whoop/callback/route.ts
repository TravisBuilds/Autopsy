import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  WHOOP_EXPIRES_COOKIE,
  WHOOP_REFRESH_COOKIE,
  WHOOP_STATE_COOKIE,
  WHOOP_TOKEN_URL,
  WHOOP_ACCESS_COOKIE,
} from "@/lib/auth/constants";

function appOrigin(request: Request): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
}

export async function GET(request: Request) {
  const origin = appOrigin(request);
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL(`/wearables?whoop=error&message=${error}`, origin));
  }

  if (!code || !state) {
    return NextResponse.redirect(new URL("/wearables?whoop=error", origin));
  }

  const clientId = process.env.WHOOP_CLIENT_ID;
  const clientSecret = process.env.WHOOP_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL("/wearables?whoop=setup", origin));
  }

  const jar = await cookies();
  const savedState = jar.get(WHOOP_STATE_COOKIE)?.value;

  if (!savedState || savedState !== state) {
    return NextResponse.redirect(new URL("/wearables?whoop=error&message=invalid_state", origin));
  }

  const redirectUri = `${origin}/api/auth/whoop/callback`;

  const tokenRes = await fetch(WHOOP_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(new URL("/wearables?whoop=error&message=token_exchange", origin));
  }

  const tokens = (await tokenRes.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
  };

  const res = NextResponse.redirect(new URL("/wearables?whoop=connected", origin));
  const secure = process.env.NODE_ENV === "production";
  const maxAge = tokens.expires_in ?? 3600;

  res.cookies.set(WHOOP_ACCESS_COOKIE, tokens.access_token, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge,
  });

  if (tokens.refresh_token) {
    res.cookies.set(WHOOP_REFRESH_COOKIE, tokens.refresh_token, {
      httpOnly: true,
      sameSite: "lax",
      secure,
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  if (tokens.expires_in) {
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();
    res.cookies.set(WHOOP_EXPIRES_COOKIE, expiresAt, {
      httpOnly: true,
      sameSite: "lax",
      secure,
      path: "/",
      maxAge: tokens.expires_in,
    });
  }

  res.cookies.delete(WHOOP_STATE_COOKIE);
  return res;
}
