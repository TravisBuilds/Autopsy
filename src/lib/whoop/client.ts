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

export async function fetchWhoopCollection<T>(
  accessToken: string,
  path: string,
  opts?: { start?: string; end?: string; maxPages?: number }
): Promise<T[]> {
  const records: T[] = [];
  let nextToken: string | undefined;
  const maxPages = opts?.maxPages ?? 8;

  for (let page = 0; page < maxPages; page++) {
    const params = new URLSearchParams({ limit: "25" });
    if (opts?.start) params.set("start", opts.start);
    if (opts?.end) params.set("end", opts.end);
    if (nextToken) params.set("nextToken", nextToken);

    const res = await whoopGet<WhoopPaginated<T>>(`${path}?${params.toString()}`, accessToken);
    if (!res) break;
    records.push(...(res.records ?? []));
    nextToken = res.next_token;
    if (!nextToken) break;
  }

  return records;
}
