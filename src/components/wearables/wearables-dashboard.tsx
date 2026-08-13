"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Link2, Watch } from "lucide-react";
import { WhoopDataPanel } from "@/components/wearables/whoop-data-panel";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useWhoopData } from "@/hooks/use-whoop-data";

export function WearablesDashboard() {
  const searchParams = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const whoopConnected = useAuthStore((s) => s.whoopConnected);
  const setWhoopStatus = useAuthStore((s) => s.setWhoopStatus);
  const { data, reload } = useWhoopData();

  const [message, setMessage] = useState<string | null>(null);
  const whoopParam = searchParams.get("whoop");
  const whoopDetail = searchParams.get("message");
  const connected = whoopConnected || Boolean(data?.connected);
  const hasHistory = (data?.daysOnRecord ?? 0) > 0;

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((session) => {
        setWhoopStatus(session.whoop?.connected ?? false, session.whoop?.expiresAt ?? null);
      })
      .catch(() => {});

    if (whoopParam === "connected") {
      setMessage(null);
      setWhoopStatus(true);
      void reload();
    } else if (whoopParam === "setup") {
      setMessage("Add WHOOP_CLIENT_ID and WHOOP_CLIENT_SECRET to your environment to enable OAuth.");
    } else if (whoopParam === "error") {
      if (whoopDetail === "invalid_scope") {
        setMessage(
          "WHOOP rejected the requested scopes. Enable matching scopes in the WHOOP Developer Dashboard, or set WHOOP_SCOPES in .env.local."
        );
      } else if (
        whoopDetail?.includes("token_exchange") &&
        whoopDetail.includes("Client authentication failed")
      ) {
        setMessage(
          "WHOOP token exchange failed. Confirm WHOOP_CLIENT_ID and WHOOP_CLIENT_SECRET match the dashboard exactly."
        );
      } else {
        setMessage(
          whoopDetail
            ? `WHOOP connection failed: ${whoopDetail}`
            : "WHOOP authorization failed. Try connecting again."
        );
      }
    }
  }, [whoopParam, whoopDetail, setWhoopStatus, reload]);

  const handleDisconnectWhoop = async () => {
    await fetch("/api/auth/whoop/disconnect", { method: "POST" });
    setWhoopStatus(false, null);
    setMessage("WHOOP disconnected. Your history stays saved — reconnect anytime to pull new days.");
    void reload();
  };

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-white/[0.08] bg-card/40 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/10">
              <Watch className="h-6 w-6 text-sky-400" />
            </div>
            <div>
              <h2 className="text-sm font-medium">WHOOP</h2>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Daily recovery stays on your account. Sign in to update — disconnect does not erase history.
              </p>
            </div>
          </div>

          {connected && (
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                Connected
              </span>
              <Button variant="outline" size="sm" onClick={handleDisconnectWhoop}>
                Disconnect
              </Button>
            </div>
          )}
        </div>

        {message && (
          <p className="mt-4 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-xs text-muted-foreground">
            {message}
          </p>
        )}

        {!user && (
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">Sign in to connect WHOOP and keep a permanent history.</p>
            <Link
              href="/login?next=/wearables"
              className={cn(buttonVariants({ size: "sm" }), "mt-4 bg-teal-600 text-white hover:bg-teal-500")}
            >
              Sign in
            </Link>
          </div>
        )}

        {user && !connected && (
          <div className="mt-4">
            <a
              href="/api/auth/whoop/authorize"
              className={cn(
                buttonVariants({ size: "sm" }),
                "inline-flex bg-sky-600 text-white hover:bg-sky-500"
              )}
            >
              <Link2 className="mr-1.5 h-4 w-4" />
              {hasHistory ? "Reconnect WHOOP" : "Connect WHOOP"}
            </a>
            {hasHistory && (
              <p className="mt-2 text-[11px] text-muted-foreground">
                History below is unchanged. Reconnect only to fetch new days.
              </p>
            )}
          </div>
        )}
      </section>

      {user && (connected || hasHistory || data) && <WhoopDataPanel />}

      {!connected && process.env.NODE_ENV === "development" && (
        <section className="rounded-xl border border-dashed border-white/10 bg-card/20 p-4 text-xs text-muted-foreground">
          <p className="font-medium text-foreground/80">Developer setup</p>
          <p className="mt-2">
            Redirect URI:{" "}
            <code className="text-teal-400/90">
              {typeof window !== "undefined"
                ? `${window.location.origin}/api/auth/whoop/callback`
                : "http://localhost:3000/api/auth/whoop/callback"}
            </code>
          </p>
        </section>
      )}
    </div>
  );
}
