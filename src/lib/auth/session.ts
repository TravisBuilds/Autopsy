import { cookies } from "next/headers";
import {
  WHOOP_ACCESS_COOKIE,
  WHOOP_EXPIRES_COOKIE,
  WHOOP_REFRESH_COOKIE,
} from "@/lib/auth/constants";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

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
  const access = jar.get(WHOOP_ACCESS_COOKIE)?.value;
  const expiresAt = jar.get(WHOOP_EXPIRES_COOKIE)?.value;

  const whoop = {
    connected: Boolean(access),
    expiresAt,
  };

  if (!isSupabaseConfigured()) {
    return { user: null, whoop };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, whoop };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, email")
    .eq("id", user.id)
    .maybeSingle();

  return {
    user: {
      id: user.id,
      displayName:
        profile?.display_name ??
        (user.user_metadata?.display_name as string | undefined) ??
        user.email?.split("@")[0] ??
        "User",
      email: profile?.email ?? user.email ?? undefined,
    },
    whoop,
  };
}

export async function clearWhoopCookies() {
  const jar = await cookies();
  jar.delete(WHOOP_ACCESS_COOKIE);
  jar.delete(WHOOP_REFRESH_COOKIE);
  jar.delete(WHOOP_EXPIRES_COOKIE);
}
