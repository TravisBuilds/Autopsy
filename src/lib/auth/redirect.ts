/**
 * App origin for auth redirects.
 * Client: always use the browser URL (avoids stale build-time env).
 * Server: request host → env → Vercel host → localhost fallback.
 */
export function getAppOrigin(): string {
  if (typeof window !== "undefined") {
    return window.location.origin.replace(/\/$/, "");
  }

  return getServerAppOrigin();
}

function getServerAppOrigin(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim()?.replace(/\/$/, "");
  if (fromEnv && !fromEnv.includes("localhost")) return fromEnv;

  const vercelHost =
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() ||
    process.env.VERCEL_URL?.trim();
  if (vercelHost) {
    const host = vercelHost.replace(/^https?:\/\//, "").replace(/\/$/, "");
    return `https://${host}`;
  }

  if (fromEnv) return fromEnv;

  return "http://localhost:3000";
}

/** Resolve origin from an incoming request (API routes, server actions). */
export function resolveAppOriginFromRequest(request: Request): string {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";
  if (forwardedHost) {
    const host = forwardedHost.split(",")[0]?.trim();
    if (host && !host.startsWith("localhost")) {
      return `${forwardedProto}://${host}`.replace(/\/$/, "");
    }
  }

  return getServerAppOrigin();
}

/** Supabase email / OAuth redirect through `/auth/callback`, then `next`. */
export function authCallbackUrl(next: string): string {
  const path = next.startsWith("/") ? next : `/${next}`;
  return `${getAppOrigin()}/auth/callback?next=${encodeURIComponent(path)}`;
}

export function authCallbackUrlForRequest(request: Request, next: string): string {
  const path = next.startsWith("/") ? next : `/${next}`;
  return `${resolveAppOriginFromRequest(request)}/auth/callback?next=${encodeURIComponent(path)}`;
}
