import { cookies } from "next/headers";
import {
  USER_COOKIE,
  WHOOP_ACCESS_COOKIE,
  WHOOP_EXPIRES_COOKIE,
  WHOOP_REFRESH_COOKIE,
} from "@/lib/auth/constants";

export interface SessionUser {
  id: string;
  displayName: string;
  email?: string;
}

export interface AppSession {
  user: SessionUser | null;
  whoop: {
    connected: boolean;
    expiresAt?: string;
  };
}

export async function getAppSession(): Promise<AppSession> {
  const jar = await cookies();
  const raw = jar.get(USER_COOKIE)?.value;

  let user: SessionUser | null = null;
  if (raw) {
    try {
      user = JSON.parse(raw) as SessionUser;
    } catch {
      user = null;
    }
  }

  const access = jar.get(WHOOP_ACCESS_COOKIE)?.value;
  const expiresAt = jar.get(WHOOP_EXPIRES_COOKIE)?.value;

  return {
    user,
    whoop: {
      connected: Boolean(access),
      expiresAt,
    },
  };
}

export async function clearWhoopCookies() {
  const jar = await cookies();
  jar.delete(WHOOP_ACCESS_COOKIE);
  jar.delete(WHOOP_REFRESH_COOKIE);
  jar.delete(WHOOP_EXPIRES_COOKIE);
}
