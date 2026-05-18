import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { WHOOP_STATE_COOKIE } from "@/lib/auth/constants";
import {
  buildWhoopAuthorizeUrl,
  generateWhoopState,
  getWhoopRedirectUri,
  resolveAppOrigin,
} from "@/lib/auth/whoop-oauth";

export async function GET(request: Request) {
  const clientId = process.env.WHOOP_CLIENT_ID?.trim();
  const clientSecret = process.env.WHOOP_CLIENT_SECRET?.trim();

  const origin = resolveAppOrigin(request);
  const redirectUri = getWhoopRedirectUri(origin);

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      new URL(`/wearables?whoop=setup&redirect_uri=${encodeURIComponent(redirectUri)}`, origin)
    );
  }

  const state = generateWhoopState();
  const jar = await cookies();

  jar.set(WHOOP_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });

  const authorizeUrl = buildWhoopAuthorizeUrl(redirectUri, state);
  return NextResponse.redirect(authorizeUrl);
}
