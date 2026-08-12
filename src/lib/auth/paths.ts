/** Routes reachable without a Supabase session. */
const PUBLIC_PREFIXES = ["/login", "/auth/callback", "/auth/reset-password"];

/** Auth API routes that must work before sign-in. */
const PUBLIC_API_PATHS = [
  "/api/auth/session",
  "/api/auth/forgot-password",
  "/api/auth/signout",
];

export function isPublicPath(pathname: string): boolean {
  if (PUBLIC_API_PATHS.some((path) => pathname === path)) return true;
  return PUBLIC_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function isAuthOnlyPath(pathname: string): boolean {
  return pathname === "/login" || pathname.startsWith("/login/");
}
