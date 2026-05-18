import { NextResponse } from "next/server";
import { getWhoopScopes, WHOOP_API_SCOPES } from "@/lib/auth/constants";
import { getWhoopRedirectUri, resolveAppOrigin } from "@/lib/auth/whoop-oauth";

/** Dev helper: verify redirect URI matches WHOOP dashboard (no secrets returned). */
export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 404 });
  }

  const origin = resolveAppOrigin(request);
  const redirectUri = getWhoopRedirectUri(origin);
  const rawId = process.env.WHOOP_CLIENT_ID ?? "";
  const rawSecret = process.env.WHOOP_CLIENT_SECRET ?? "";
  const clientId = rawId.trim();
  const clientSecret = rawSecret.trim();

  const requestedScopes = getWhoopScopes();

  return NextResponse.json({
    origin,
    redirectUri,
    envAppUrl: process.env.NEXT_PUBLIC_APP_URL ?? null,
    hasClientId: Boolean(clientId),
    hasClientSecret: Boolean(clientSecret),
    clientIdLength: clientId.length,
    clientSecretLength: clientSecret.length,
    clientIdHadWhitespace: rawId !== clientId,
    clientSecretHadWhitespace: rawSecret !== clientSecret,
    clientIdWrappedInQuotes:
      (clientId.startsWith('"') && clientId.endsWith('"')) ||
      (clientId.startsWith("'") && clientId.endsWith("'")),
    clientSecretWrappedInQuotes:
      (clientSecret.startsWith('"') && clientSecret.endsWith('"')) ||
      (clientSecret.startsWith("'") && clientSecret.endsWith("'")),
    requestedScopes: requestedScopes.split(/\s+/),
    scopesFromEnv: Boolean(process.env.WHOOP_SCOPES?.trim()),
    documentedApiScopes: [...WHOOP_API_SCOPES],
    tokenAuth: "client_id and client_secret are sent in the POST body (WHOOP does not use HTTP Basic for token exchange).",
    hint: "Register redirectUri exactly in WHOOP Developer Dashboard. Enable every scope in requestedScopes on your app (plus offline for refresh tokens).",
  });
}
