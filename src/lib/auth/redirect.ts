/** Supabase email / OAuth redirect through `/auth/callback`, then `next`. */
export function authCallbackUrl(next: string): string {
  const base = (
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000")
  ).replace(/\/$/, "");
  const path = next.startsWith("/") ? next : `/${next}`;
  return `${base}/auth/callback?next=${encodeURIComponent(path)}`;
}
