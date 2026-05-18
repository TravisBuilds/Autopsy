import type { WearableSnapshot } from "@/types/health";
import type {
  WhoopCycle,
  WhoopDashboardData,
  WhoopProfile,
  WhoopRecovery,
  WhoopSleep,
} from "@/lib/whoop/types";

function formatWhoopDate(iso: string): string {
  return iso.slice(0, 10);
}

function snapshotFromRecovery(
  recovery: WhoopRecovery,
  cycleById: Map<number, WhoopCycle>,
  sleepById: Map<string, WhoopSleep>
): WearableSnapshot | null {
  if (recovery.score_state !== "SCORED" || !recovery.score) return null;

  const cycle = cycleById.get(recovery.cycle_id);
  const sleep = sleepById.get(recovery.sleep_id);
  const dateSource = cycle?.start ?? recovery.created_at;

  const strain =
    cycle?.score_state === "SCORED" && cycle.score ? cycle.score.strain : 0;
  const sleepScore =
    sleep?.score_state === "SCORED" && sleep.score?.sleep_performance_percentage != null
      ? Math.round(sleep.score.sleep_performance_percentage)
      : 0;

  return {
    source: "WHOOP",
    date: formatWhoopDate(dateSource),
    recovery: Math.round(recovery.score.recovery_score),
    hrv: Math.round(recovery.score.hrv_rmssd_milli),
    restingHr: Math.round(recovery.score.resting_heart_rate),
    sleepScore,
    strain: Number(strain.toFixed(1)),
  };
}

export function buildWhoopDashboardData(
  profile: WhoopProfile | null,
  recoveries: WhoopRecovery[],
  cycles: WhoopCycle[],
  sleeps: WhoopSleep[]
): WhoopDashboardData {
  const cycleById = new Map(cycles.map((c) => [c.id, c]));
  const sleepById = new Map(sleeps.map((s) => [s.id, s]));

  const history: WearableSnapshot[] = [];
  for (const recovery of recoveries) {
    const snap = snapshotFromRecovery(recovery, cycleById, sleepById);
    if (snap) history.push(snap);
  }

  const latest = history[0] ?? null;
  const past = history.slice(1);

  const hasPending = recoveries.some((r) => r.score_state === "PENDING_SCORE");

  return {
    profile: profile
      ? {
          firstName: profile.first_name,
          lastName: profile.last_name,
          email: profile.email,
        }
      : null,
    latest,
    history: past,
    status: latest ? "ready" : hasPending ? "pending" : "empty",
  };
}
