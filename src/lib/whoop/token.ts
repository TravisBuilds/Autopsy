import { cookies } from "next/headers";
import {
  WHOOP_ACCESS_COOKIE,
  WHOOP_EXPIRES_COOKIE,
  WHOOP_REFRESH_COOKIE,
} from "@/lib/auth/constants";
import { refreshWhoopAccessToken } from "@/lib/auth/whoop-oauth";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  deleteWhoopConnection,
  getWhoopConnection,
  upsertWhoopConnection,
} from "@/lib/whoop/connection";

const REFRESH_BUFFER_MS = 60_000;

type TokenBundle = {
  access: string;
  refresh: string;
  expiresAt: string;
};

function cookieBase(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

export async function writeWhoopTokenCookies(tokens: {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}) {
  const jar = await cookies();
  const maxAge = tokens.expiresIn ?? 3600;
  jar.set(WHOOP_ACCESS_COOKIE, tokens.accessToken, cookieBase(maxAge));

  if (tokens.refreshToken) {
    jar.set(WHOOP_REFRESH_COOKIE, tokens.refreshToken, cookieBase(60 * 60 * 24 * 30));
  }

  if (tokens.expiresIn) {
    const expiresAt = new Date(Date.now() + tokens.expiresIn * 1000).toISOString();
    jar.set(WHOOP_EXPIRES_COOKIE, expiresAt, cookieBase(tokens.expiresIn));
  }
}

async function persistRefreshedTokens(
  userId: string | null,
  accessToken: string,
  refreshToken: string,
  expiresIn?: number
): Promise<string> {
  const expiresAt = new Date(Date.now() + (expiresIn ?? 3600) * 1000).toISOString();
  await writeWhoopTokenCookies({ accessToken, refreshToken, expiresIn });

  if (userId && isSupabaseConfigured()) {
    const supabase = await createClient();
    await upsertWhoopConnection(supabase, userId, {
      accessToken,
      refreshToken,
      expiresAt,
    });
  }

  return accessToken;
}

async function readCookieBundle(): Promise<Partial<TokenBundle>> {
  const jar = await cookies();
  return {
    access: jar.get(WHOOP_ACCESS_COOKIE)?.value,
    refresh: jar.get(WHOOP_REFRESH_COOKIE)?.value,
    expiresAt: jar.get(WHOOP_EXPIRES_COOKIE)?.value,
  };
}

export async function getValidWhoopAccessToken(): Promise<string | null> {
  let userId: string | null = null;
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userId = user?.id ?? null;

    if (userId) {
      const connection = await getWhoopConnection(supabase, userId);
      if (connection) {
        const expired =
          new Date(connection.expires_at).getTime() <= Date.now() + REFRESH_BUFFER_MS;
        if (!expired) {
          await writeWhoopTokenCookies({
            accessToken: connection.access_token,
            refreshToken: connection.refresh_token,
            expiresIn: Math.max(
              60,
              Math.floor((new Date(connection.expires_at).getTime() - Date.now()) / 1000)
            ),
          });
          return connection.access_token;
        }

        const result = await refreshWhoopAccessToken(connection.refresh_token);
        if (result.ok) {
          return persistRefreshedTokens(
            userId,
            result.access_token,
            result.refresh_token ?? connection.refresh_token,
            result.expires_in
          );
        }

        await deleteWhoopConnection(supabase, userId);
        const jar = await cookies();
        jar.delete(WHOOP_ACCESS_COOKIE);
        jar.delete(WHOOP_REFRESH_COOKIE);
        jar.delete(WHOOP_EXPIRES_COOKIE);
        return null;
      }
    }
  }

  const cookiesBundle = await readCookieBundle();
  const expired =
    cookiesBundle.expiresAt &&
    new Date(cookiesBundle.expiresAt).getTime() <= Date.now() + REFRESH_BUFFER_MS;

  if (cookiesBundle.access && !expired) return cookiesBundle.access;
  if (!cookiesBundle.refresh) return cookiesBundle.access ?? null;

  const result = await refreshWhoopAccessToken(cookiesBundle.refresh);
  if (!result.ok) return null;

  return persistRefreshedTokens(
    userId,
    result.access_token,
    result.refresh_token ?? cookiesBundle.refresh,
    result.expires_in
  );
}
