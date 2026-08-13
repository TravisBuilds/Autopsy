import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { buildWhoopDashboardData } from "@/lib/whoop/build-summary";
import {
  fetchWhoopCycles,
  fetchWhoopProfile,
  fetchWhoopRecoveries,
  fetchWhoopSleep,
} from "@/lib/whoop/client";
import { getWhoopConnection, upsertWhoopConnection } from "@/lib/whoop/connection";
import { buildDashboardFromRows } from "@/lib/whoop/mappers";
import { loadWhoopSnapshotRows, syncWhoopSnapshots, whoopSyncIsStale } from "@/lib/whoop/sync";
import { getValidWhoopAccessToken } from "@/lib/whoop/token";

export async function GET(request: Request) {
  const forceSync = new URL(request.url).searchParams.get("sync") === "1";

  if (!isSupabaseConfigured()) {
    return liveOnlyResponse();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let connection = await getWhoopConnection(supabase, user.id);
  const accessToken = await getValidWhoopAccessToken();
  connection = await getWhoopConnection(supabase, user.id);

  if (accessToken && (forceSync || whoopSyncIsStale(connection?.last_synced_at))) {
    const profile = await syncWhoopSnapshots(supabase, user.id, accessToken, {
      forceFull: forceSync && !connection?.last_synced_at,
    });
    if (profile && connection) {
      await upsertWhoopConnection(
        supabase,
        user.id,
        {
          accessToken,
          refreshToken: connection.refresh_token,
          expiresAt: connection.expires_at,
        },
        profile
      );
    }
    connection = await getWhoopConnection(supabase, user.id);
  }

  const rows = await loadWhoopSnapshotRows(supabase, user.id);
  const connected = Boolean(accessToken || connection);
  const profile = connection
    ? connection.first_name || connection.last_name || connection.email
      ? {
          firstName: connection.first_name ?? "",
          lastName: connection.last_name ?? "",
          email: connection.email ?? "",
        }
      : null
    : null;

  return NextResponse.json(
    buildDashboardFromRows(rows, {
      connected,
      lastSyncedAt: connection?.last_synced_at ?? null,
      profile,
    })
  );
}

async function liveOnlyResponse() {
  const accessToken = await getValidWhoopAccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: "not_connected" }, { status: 401 });
  }

  const [profile, recoveriesRes, cyclesRes, sleepRes] = await Promise.all([
    fetchWhoopProfile(accessToken),
    fetchWhoopRecoveries(accessToken, 25),
    fetchWhoopCycles(accessToken, 25),
    fetchWhoopSleep(accessToken, 25),
  ]);

  const data = buildWhoopDashboardData(
    profile,
    recoveriesRes?.records ?? [],
    cyclesRes?.records ?? [],
    sleepRes?.records ?? []
  );

  return NextResponse.json({
    ...data,
    connected: true,
    daysOnRecord: (data.latest ? 1 : 0) + data.history.length,
    lastSyncedAt: new Date().toISOString(),
  });
}
