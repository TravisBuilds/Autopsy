import { cookies } from "next/headers";
import {
  WHOOP_ACCESS_COOKIE,
  WHOOP_EXPIRES_COOKIE,
  WHOOP_REFRESH_COOKIE,
} from "@/lib/auth/constants";
import { refreshWhoopAccessToken } from "@/lib/auth/whoop-oauth";

const REFRESH_BUFFER_MS = 60_000;

export async function getValidWhoopAccessToken(): Promise<string | null> {
  const jar = await cookies();
  const access = jar.get(WHOOP_ACCESS_COOKIE)?.value;
  const refresh = jar.get(WHOOP_REFRESH_COOKIE)?.value;
  const expiresAt = jar.get(WHOOP_EXPIRES_COOKIE)?.value;

  const expired =
    expiresAt && new Date(expiresAt).getTime() <= Date.now() + REFRESH_BUFFER_MS;

  if (access && !expired) return access;
  if (!refresh) return access ?? null;

  const result = await refreshWhoopAccessToken(refresh);
  if (!result.ok) return null;

  const secure = process.env.NODE_ENV === "production";
  const maxAge = result.expires_in ?? 3600;

  jar.set(WHOOP_ACCESS_COOKIE, result.access_token, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge,
  });

  if (result.refresh_token) {
    jar.set(WHOOP_REFRESH_COOKIE, result.refresh_token, {
      httpOnly: true,
      sameSite: "lax",
      secure,
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  if (result.expires_in) {
    const nextExpiry = new Date(Date.now() + result.expires_in * 1000).toISOString();
    jar.set(WHOOP_EXPIRES_COOKIE, nextExpiry, {
      httpOnly: true,
      sameSite: "lax",
      secure,
      path: "/",
      maxAge: result.expires_in,
    });
  }

  return result.access_token;
}
