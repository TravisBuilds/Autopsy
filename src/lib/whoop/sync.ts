import type { Database } from "@/lib/supabase/database.types";
import type { createClient } from "@/lib/supabase/server";
import { fetchWhoopCollection, fetchWhoopProfile } from "@/lib/whoop/client";
import { markWhoopSynced } from "@/lib/whoop/connection";
import { snapshotFromRecovery } from "@/lib/whoop/mappers";
import type { WhoopCycle, WhoopProfile, WhoopRecovery, WhoopSleep } from "@/lib/whoop/types";

type Client = Awaited<ReturnType<typeof createClient>>;
type SnapshotRow = Database["public"]["Tables"]["whoop_snapshots"]["Row"];

const FIRST_SYNC_DAYS = 90;
const INCREMENTAL_OVERLAP_DAYS = 2;
const STALE_MS = 15 * 60 * 1000;

export function whoopSyncIsStale(lastSyncedAt: string | null | undefined): boolean {
  if (!lastSyncedAt) return true;
  return Date.now() - new Date(lastSyncedAt).getTime() > STALE_MS;
}

export async function syncWhoopSnapshots(
  supabase: Client,
  userId: string,
  accessToken: string,
  opts?: { forceFull?: boolean }
): Promise<WhoopProfile | null> {
  const { data: latestRow } = await supabase
    .from("whoop_snapshots")
    .select("snapshot_date")
    .eq("user_id", userId)
    .order("snapshot_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  const now = new Date();
  let start: string;
  const latestDate = (latestRow as { snapshot_date?: string } | null)?.snapshot_date;
  if (!opts?.forceFull && latestDate) {
    const from = new Date(`${latestDate}T00:00:00.000Z`);
    from.setUTCDate(from.getUTCDate() - INCREMENTAL_OVERLAP_DAYS);
    start = from.toISOString();
  } else {
    const from = new Date(now);
    from.setUTCDate(from.getUTCDate() - FIRST_SYNC_DAYS);
    start = from.toISOString();
  }

  const [profile, recoveries, cycles, sleeps] = await Promise.all([
    fetchWhoopProfile(accessToken),
    fetchWhoopCollection<WhoopRecovery>(accessToken, "/v2/recovery", { start }),
    fetchWhoopCollection<WhoopCycle>(accessToken, "/v2/cycle", { start }),
    fetchWhoopCollection<WhoopSleep>(accessToken, "/v2/activity/sleep", { start }),
  ]);

  const cycleById = new Map(cycles.map((c) => [c.id, c]));
  const sleepById = new Map(sleeps.map((s) => [s.id, s]));
  const nowIso = new Date().toISOString();

  const rows = recoveries.map((recovery) => ({
    ...snapshotFromRecovery(recovery, cycleById, sleepById),
    user_id: userId,
    synced_at: nowIso,
    updated_at: nowIso,
  }));

  if (rows.length > 0) {
    const { error } = await supabase.from("whoop_snapshots").upsert(rows, {
      onConflict: "user_id,snapshot_date",
    });
    if (error) {
      console.error("whoop_snapshots upsert:", error.message);
    }
  }

  await markWhoopSynced(supabase, userId);
  return profile;
}

export async function loadWhoopSnapshotRows(supabase: Client, userId: string) {
  const { data, error } = await supabase
    .from("whoop_snapshots")
    .select("*")
    .eq("user_id", userId)
    .order("snapshot_date", { ascending: false });

  if (error) {
    console.error("whoop_snapshots read:", error.message);
    return [];
  }
  return (data as SnapshotRow[] | null) ?? [];
}
