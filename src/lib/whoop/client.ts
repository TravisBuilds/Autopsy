import type {
  WhoopCycle,
  WhoopPaginated,
  WhoopProfile,
  WhoopRecovery,
  WhoopSleep,
} from "@/lib/whoop/types";

const WHOOP_API_BASE = "https://api.prod.whoop.com/developer";

async function whoopGet<T>(path: string, accessToken: string): Promise<T | null> {
  const res = await fetch(`${WHOOP_API_BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) return null;
  return (await res.json()) as T;
}

export function fetchWhoopProfile(accessToken: string) {
  return whoopGet<WhoopProfile>("/v2/user/profile/basic", accessToken);
}

export function fetchWhoopRecoveries(accessToken: string, limit = 14) {
  return whoopGet<WhoopPaginated<WhoopRecovery>>(
    `/v2/recovery?limit=${limit}`,
    accessToken
  );
}

export function fetchWhoopCycles(accessToken: string, limit = 14) {
  return whoopGet<WhoopPaginated<WhoopCycle>>(`/v2/cycle?limit=${limit}`, accessToken);
}

export function fetchWhoopSleep(accessToken: string, limit = 14) {
  return whoopGet<WhoopPaginated<WhoopSleep>>(
    `/v2/activity/sleep?limit=${limit}`,
    accessToken
  );
}
