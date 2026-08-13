import type { WearableSnapshot } from "@/types/health";
import type { Database, Json } from "@/lib/supabase/database.types";
import type {
  WhoopCycle,
  WhoopDashboardData,
  WhoopRecovery,
  WhoopSleep,
} from "@/lib/whoop/types";

type SnapshotRow = Database["public"]["Tables"]["whoop_snapshots"]["Row"];
type SnapshotInsert = Database["public"]["Tables"]["whoop_snapshots"]["Insert"];

export function formatWhoopDate(iso: string): string {
  return iso.slice(0, 10);
}

export function snapshotFromRecovery(
  recovery: WhoopRecovery,
  cycleById: Map<number, WhoopCycle>,
  sleepById: Map<string, WhoopSleep>
): Omit<SnapshotInsert, "user_id"> {
  const cycle = cycleById.get(recovery.cycle_id);
  const sleep = sleepById.get(recovery.sleep_id);
  const dateSource = cycle?.start ?? recovery.created_at;
  const scored = recovery.score_state === "SCORED" && recovery.score;
  const cycleScored = cycle?.score_state === "SCORED" && cycle.score;
  const sleepScored = sleep?.score_state === "SCORED" && sleep.score;

  return {
    snapshot_date: formatWhoopDate(dateSource),
    source: "WHOOP",
    cycle_id: recovery.cycle_id,
    sleep_id: recovery.sleep_id,
    score_state: recovery.score_state,
    recovery: scored ? Math.round(recovery.score!.recovery_score) : null,
    hrv: scored ? Math.round(recovery.score!.hrv_rmssd_milli) : null,
    resting_hr: scored ? Math.round(recovery.score!.resting_heart_rate) : null,
    sleep_score:
      sleepScored && sleep.score?.sleep_performance_percentage != null
        ? Math.round(sleep.score.sleep_performance_percentage)
        : null,
    strain: cycleScored ? Number(cycle.score!.strain.toFixed(1)) : null,
    sleep_efficiency:
      sleepScored && sleep.score?.sleep_efficiency_percentage != null
        ? Math.round(sleep.score.sleep_efficiency_percentage)
        : null,
    respiratory_rate:
      sleep?.score_state === "SCORED" ? (sleep.score?.respiratory_rate ?? null) : null,
    spo2: scored ? recovery.score!.spo2_percentage ?? null : null,
    skin_temp_celsius: scored ? recovery.score!.skin_temp_celsius ?? null : null,
    kilojoule: cycleScored ? cycle.score!.kilojoule : null,
    avg_hr: cycleScored ? cycle.score!.average_heart_rate : null,
    max_hr: cycleScored ? cycle.score!.max_heart_rate : null,
    raw: {
      recovery,
      cycle: cycle ?? null,
      sleep: sleep ?? null,
    } as unknown as Json,
    synced_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export function rowToWearableSnapshot(row: SnapshotRow): WearableSnapshot | null {
  if (row.score_state !== "SCORED" || row.recovery == null) return null;
  return {
    source: row.source || "WHOOP",
    date: row.snapshot_date,
    recovery: row.recovery,
    hrv: row.hrv ?? 0,
    restingHr: row.resting_hr ?? 0,
    sleepScore: row.sleep_score ?? 0,
    strain: row.strain != null ? Number(row.strain) : 0,
  };
}

export function buildDashboardFromRows(
  rows: SnapshotRow[],
  opts: {
    connected: boolean;
    lastSyncedAt: string | null;
    profile: WhoopDashboardData["profile"];
    pending?: boolean;
  }
): WhoopDashboardData {
  const scored = rows
    .map(rowToWearableSnapshot)
    .filter((s): s is WearableSnapshot => Boolean(s))
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  const latest = scored[0] ?? null;
  const history = scored.slice(1);
  const hasPending =
    opts.pending || rows.some((r) => r.score_state === "PENDING_SCORE");

  return {
    profile: opts.profile,
    latest,
    history,
    status: latest ? "ready" : hasPending ? "pending" : "empty",
    connected: opts.connected,
    daysOnRecord: scored.length,
    lastSyncedAt: opts.lastSyncedAt,
  };
}

