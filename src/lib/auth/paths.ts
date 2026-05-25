/** Routes reachable without a Supabase session. */
const PUBLIC_PREFIXES = ["/login", "/auth/callback", "/auth/reset-password"];

export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function isAuthOnlyPath(pathname: string): boolean {
  return pathname === "/login" || pathname.startsWith("/login/");
}
