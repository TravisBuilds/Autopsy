import { getWhoopScopes } from "@/lib/auth/constants";
import type { Database } from "@/lib/supabase/database.types";
import type { createClient } from "@/lib/supabase/server";
import type { WhoopProfile } from "@/lib/whoop/types";

type Client = Awaited<ReturnType<typeof createClient>>;
type ConnectionRow = Database["public"]["Tables"]["whoop_connections"]["Row"];

export async function getWhoopConnection(
  supabase: Client,
  userId: string
): Promise<ConnectionRow | null> {
  const { data, error } = await supabase
    .from("whoop_connections")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("whoop_connections read:", error.message);
    return null;
  }
  return (data as ConnectionRow | null) ?? null;
}

export async function upsertWhoopConnection(
  supabase: Client,
  userId: string,
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresAt: string;
  },
  profile?: WhoopProfile | null
) {
  const now = new Date().toISOString();
  const existing = await getWhoopConnection(supabase, userId);

  const tokenFields = {
    access_token: tokens.accessToken,
    refresh_token: tokens.refreshToken,
    expires_at: tokens.expiresAt,
    scopes: getWhoopScopes(),
    updated_at: now,
  };

  const profileFields = profile
    ? {
        whoop_user_id: profile.user_id,
        email: profile.email,
        first_name: profile.first_name,
        last_name: profile.last_name,
      }
    : {};

  if (existing) {
    const { error } = await supabase
      .from("whoop_connections")
      .update({ ...tokenFields, ...profileFields })
      .eq("user_id", userId);
    if (error) console.error("whoop_connections update:", error.message);
    return;
  }

  const { error } = await supabase.from("whoop_connections").insert({
    user_id: userId,
    ...tokenFields,
    ...profileFields,
  });
  if (error) console.error("whoop_connections insert:", error.message);
}

export async function markWhoopSynced(supabase: Client, userId: string) {
  const { error } = await supabase
    .from("whoop_connections")
    .update({ last_synced_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("user_id", userId);

  if (error) {
    console.error("whoop_connections last_synced_at:", error.message);
  }
}

/** Drop OAuth tokens only — snapshots stay. */
export async function deleteWhoopConnection(supabase: Client, userId: string) {
  const { error } = await supabase.from("whoop_connections").delete().eq("user_id", userId);
  if (error) {
    console.error("whoop_connections delete:", error.message);
  }
}
