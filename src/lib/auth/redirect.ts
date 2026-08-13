/**
 * App origin for auth redirects.
 * Prefer the browser origin (pulsecheck.space) over env / Vercel / localhost.
 * On Vercel, `request.url` is often `http://localhost:3000` even in production.
 */

const PRODUCTION_APP_ORIGIN = "https://pulsecheck.space";

export function getAppOrigin(): string {
  if (typeof window !== "undefined") {
    return window.location.origin.replace(/\/$/, "");
  }

  return getServerAppOrigin();
}

function isLocalhostHost(host: string): boolean {
  const h = host.replace(/:\d+$/, "").toLowerCase();
  return h === "localhost" || h === "127.0.0.1" || h === "::1" || h === "[::1]";
}

function originFromValue(value: string | null | undefined): string | null {
  if (!value?.trim()) return null;
  try {
    const url = new URL(value.includes("://") ? value : `https://${value}`);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.origin;
  } catch {
    return null;
  }
}

function pickPublicOrigin(candidates: Array<string | null | undefined>): string | null {
  const origins = candidates
    .map((c) => originFromValue(c))
    .filter((o): o is string => Boolean(o));

  return origins.find((o) => !isLocalhostHost(new URL(o).hostname)) ?? null;
}

function forwardedOrigin(request: Request): string | null {
  const forwardedHost = request.headers.get("x-forwarded-host");
  if (!forwardedHost) return null;
  const host = forwardedHost.split(",")[0]?.trim();
  if (!host) return null;
  const proto =
    request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
    (isLocalhostHost(host) ? "http" : "https");
  return `${proto}://${host}`;
}

function hostHeaderOrigin(request: Request): string | null {
  const host = request.headers.get("host")?.split(",")[0]?.trim();
  if (!host) return null;
  const proto =
    request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
    (isLocalhostHost(host) ? "http" : "https");
  return `${proto}://${host}`;
}

function getServerAppOrigin(): string {
  const fromEnv = originFromValue(process.env.NEXT_PUBLIC_APP_URL);
  if (fromEnv && !isLocalhostHost(new URL(fromEnv).hostname)) return fromEnv;

  const vercelHost =
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() ||
    process.env.VERCEL_URL?.trim();
  const vercelOrigin = originFromValue(vercelHost);
  if (vercelOrigin && !isLocalhostHost(new URL(vercelOrigin).hostname)) {
    return vercelOrigin.startsWith("http://")
      ? `https://${new URL(vercelOrigin).host}`
      : vercelOrigin;
  }

  if (process.env.NODE_ENV === "production") return PRODUCTION_APP_ORIGIN;
  if (fromEnv) return fromEnv;
  return "http://localhost:3000";
}

/** Resolve origin from an incoming request (API routes, server actions). */
export function resolveAppOriginFromRequest(
  request: Request,
  clientOrigin?: string | null
): string {
  const publicOrigin = pickPublicOrigin([
    clientOrigin,
    request.headers.get("origin"),
    request.headers.get("referer"),
    forwardedOrigin(request),
    hostHeaderOrigin(request),
    getServerAppOrigin(),
    process.env.NODE_ENV === "production" ? PRODUCTION_APP_ORIGIN : null,
  ]);
  if (publicOrigin) return publicOrigin;

  return (
    originFromValue(clientOrigin) ||
    originFromValue(request.headers.get("origin")) ||
    originFromValue(request.headers.get("referer")) ||
    originFromValue(forwardedOrigin(request)) ||
    originFromValue(hostHeaderOrigin(request)) ||
    getServerAppOrigin()
  );
}

/**
 * Canonical public origin for Supabase email redirects.
 * Never localhost / vercel.app — those fail the allowlist and emails fall back
 * to Site URL (`http://localhost:3000/?code=...`).
 */
export function canonicalAuthOrigin(
  request: Request,
  clientOrigin?: string | null
): string {
  const resolved = resolveAppOriginFromRequest(request, clientOrigin);
  try {
    const host = new URL(resolved).hostname;
    if (!isLocalhostHost(host) && !host.endsWith(".vercel.app")) return resolved;
  } catch {
    /* use production origin */
  }

  const requestHost =
    request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ||
    request.headers.get("host")?.split(",")[0]?.trim() ||
    "";
  if (isLocalhostHost(requestHost) && process.env.NODE_ENV !== "production") {
    return resolved;
  }

  return PRODUCTION_APP_ORIGIN;
}

/**
 * Supabase `redirectTo` must be query-string free or it is rejected and
 * emails use Site URL instead (`http://localhost:3000/?code=...`).
 * Pass `next` via AUTH_NEXT_COOKIE, not the URL.
 */
export function authCallbackUrl(_next?: string): string {
  return `${getAppOrigin()}/auth/callback`;
}

export function authCallbackUrlForRequest(
  request: Request,
  _next?: string,
  clientOrigin?: string | null
): string {
  return `${canonicalAuthOrigin(request, clientOrigin)}/auth/callback`;
}
