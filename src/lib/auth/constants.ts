export const USER_COOKIE = "autopsy_user";
/** After email auth, `/auth/callback` reads this instead of a `?next=` query (Supabase allowlists ignore query strings). */
export const AUTH_NEXT_COOKIE = "pc_auth_next";
export const WHOOP_STATE_COOKIE = "autopsy_whoop_state";
export const WHOOP_ACCESS_COOKIE = "autopsy_whoop_access";
export const WHOOP_REFRESH_COOKIE = "autopsy_whoop_refresh";
export const WHOOP_EXPIRES_COOKIE = "autopsy_whoop_expires";

export const WHOOP_AUTH_URL = "https://api.prod.whoop.com/oauth/oauth2/auth";
export const WHOOP_TOKEN_URL = "https://api.prod.whoop.com/oauth/oauth2/token";

/** Documented WHOOP API scopes (see developer.whoop.com/api → Authentication). */
export const WHOOP_API_SCOPES = [
  "read:profile",
  "read:recovery",
  "read:sleep",
  "read:cycles",
  "read:workout",
  "read:body_measurement",
] as const;

/**
 * Default OAuth scopes. Must be a subset of scopes enabled on your app in the
 * WHOOP Developer Dashboard — requesting any other scope returns `invalid_scope`.
 * Override with WHOOP_SCOPES in .env.local (space-separated).
 */
const WHOOP_DEFAULT_SCOPES = [
  "offline",
  "read:profile",
  "read:recovery",
  "read:sleep",
  "read:cycles",
].join(" ");

export function getWhoopScopes(): string {
  const fromEnv = process.env.WHOOP_SCOPES?.trim();
  return fromEnv || WHOOP_DEFAULT_SCOPES;
}
