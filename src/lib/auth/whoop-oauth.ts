import {
  getWhoopScopes,
  WHOOP_AUTH_URL,
  WHOOP_TOKEN_URL,
} from "@/lib/auth/constants";

export function getWhoopRedirectUri(origin: string): string {
  const base = origin.replace(/\/$/, "");
  return `${base}/api/auth/whoop/callback`;
}

/** WHOOP requires state to be 8 characters when self-generated. */
export function generateWhoopState(): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let state = "";
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  for (let i = 0; i < 8; i++) {
    state += chars[bytes[i] % chars.length];
  }
  return state;
}

export function resolveAppOrigin(request: Request): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  return new URL(request.url).origin;
}

export type WhoopTokenResult =
  | {
      ok: true;
      access_token: string;
      refresh_token?: string;
      expires_in?: number;
    }
  | { ok: false; status: number; error: string };

function getWhoopClientCredentials():
  | { clientId: string; clientSecret: string }
  | { ok: false; error: string } {
  const clientId = process.env.WHOOP_CLIENT_ID?.trim();
  const clientSecret = process.env.WHOOP_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    return { ok: false, error: "Missing WHOOP_CLIENT_ID or WHOOP_CLIENT_SECRET" };
  }
  return { clientId, clientSecret };
}

/** WHOOP expects client_id/client_secret in the form body, not HTTP Basic auth. */
async function postWhoopToken(body: URLSearchParams): Promise<WhoopTokenResult> {
  const creds = getWhoopClientCredentials();
  if ("ok" in creds) {
    return { ok: false, status: 400, error: creds.error };
  }

  body.set("client_id", creds.clientId);
  body.set("client_secret", creds.clientSecret);

  const tokenRes = await fetch(WHOOP_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: body.toString(),
  });

  const raw = await tokenRes.text();
  let parsed: Record<string, unknown> = {};
  try {
    parsed = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
  } catch {
    parsed = { raw };
  }

  if (!tokenRes.ok) {
    const message =
      typeof parsed.error_description === "string"
        ? parsed.error_description
        : typeof parsed.error === "string"
          ? parsed.error
          : raw || `HTTP ${tokenRes.status}`;
    return { ok: false, status: tokenRes.status, error: message };
  }

  const access_token = parsed.access_token;
  if (typeof access_token !== "string") {
    return { ok: false, status: 500, error: "WHOOP response missing access_token" };
  }

  return {
    ok: true,
    access_token,
    refresh_token:
      typeof parsed.refresh_token === "string" ? parsed.refresh_token : undefined,
    expires_in: typeof parsed.expires_in === "number" ? parsed.expires_in : undefined,
  };
}

export async function exchangeWhoopAuthorizationCode(
  code: string,
  redirectUri: string
): Promise<WhoopTokenResult> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
  });
  return postWhoopToken(body);
}

export async function refreshWhoopAccessToken(
  refreshToken: string
): Promise<WhoopTokenResult> {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    scope: "offline",
  });
  return postWhoopToken(body);
}

export function buildWhoopAuthorizeUrl(redirectUri: string, state: string): string {
  const url = new URL(WHOOP_AUTH_URL);
  url.searchParams.set("client_id", process.env.WHOOP_CLIENT_ID!.trim());
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", getWhoopScopes());
  url.searchParams.set("state", state);
  return url.toString();
}
