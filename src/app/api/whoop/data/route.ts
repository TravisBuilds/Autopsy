import { NextResponse } from "next/server";
import { buildWhoopDashboardData } from "@/lib/whoop/build-summary";
import {
  fetchWhoopCycles,
  fetchWhoopProfile,
  fetchWhoopRecoveries,
  fetchWhoopSleep,
} from "@/lib/whoop/client";
import { getValidWhoopAccessToken } from "@/lib/whoop/token";

export async function GET() {
  const accessToken = await getValidWhoopAccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: "not_connected" }, { status: 401 });
  }

  const [profile, recoveriesRes, cyclesRes, sleepRes] = await Promise.all([
    fetchWhoopProfile(accessToken),
    fetchWhoopRecoveries(accessToken),
    fetchWhoopCycles(accessToken),
    fetchWhoopSleep(accessToken),
  ]);

  const recoveries = recoveriesRes?.records ?? [];
  const cycles = cyclesRes?.records ?? [];
  const sleeps = sleepRes?.records ?? [];

  const data = buildWhoopDashboardData(profile, recoveries, cycles, sleeps);

  return NextResponse.json(data);
}
