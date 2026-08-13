import type { WearableSnapshot } from "@/types/health";

export type WhoopScoreState = "SCORED" | "PENDING_SCORE" | "UNSCORABLE";

export interface WhoopRecoveryScore {
  recovery_score: number;
  resting_heart_rate: number;
  hrv_rmssd_milli: number;
  spo2_percentage?: number;
  skin_temp_celsius?: number;
  user_calibrating?: boolean;
}

export interface WhoopRecovery {
  cycle_id: number;
  sleep_id: string;
  created_at: string;
  updated_at: string;
  score_state: WhoopScoreState;
  score?: WhoopRecoveryScore;
}

export interface WhoopCycleScore {
  strain: number;
  kilojoule: number;
  average_heart_rate: number;
  max_heart_rate: number;
}

export interface WhoopCycle {
  id: number;
  start: string;
  end?: string;
  created_at: string;
  score_state: WhoopScoreState;
  score?: WhoopCycleScore;
}

export interface WhoopSleepScore {
  sleep_performance_percentage?: number;
  sleep_efficiency_percentage?: number;
  respiratory_rate?: number;
}

export interface WhoopSleep {
  id: string;
  cycle_id: number;
  start: string;
  end: string;
  created_at: string;
  score_state: WhoopScoreState;
  score?: WhoopSleepScore;
}

export interface WhoopProfile {
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
}

export interface WhoopPaginated<T> {
  records: T[];
  next_token?: string;
}

export interface WhoopDashboardData {
  profile: {
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  latest: WearableSnapshot | null;
  history: WearableSnapshot[];
  status: "ready" | "pending" | "empty";
  connected: boolean;
  daysOnRecord: number;
  lastSyncedAt: string | null;
}
