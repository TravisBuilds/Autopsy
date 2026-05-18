import { NextResponse } from "next/server";
import {
  WHOOP_AUTH_URL,
  WHOOP_SCOPES,
  WHOOP_STATE_COOKIE,
} from "@/lib/auth/constants";

function appOrigin(request: Request): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    new URL(request.url).origin
  );
}

export async function GET(request: Request) {
  const clientId = process.env.WHOOP_CLIENT_ID;
  if (!clientId) {
    return NextResponse.redirect(
      new URL("/wearables?whoop=setup", appOrigin(request))
    );
  }

  const state = crypto.randomUUID();
  const redirectUri = `${appOrigin(request)}/api/auth/whoop/callback`;

  const url = new URL(WHOOP_AUTH_URL);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", WHOOP_SCOPES);
  url.searchParams.set("state", state);

  const res = NextResponse.redirect(url.toString());
  res.cookies.set(WHOOP_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });

  return res;
}
