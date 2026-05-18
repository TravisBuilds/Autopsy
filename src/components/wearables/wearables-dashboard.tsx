"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Link2, LogOut, Watch } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

export function WearablesDashboard() {
  const searchParams = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const whoopConnected = useAuthStore((s) => s.whoopConnected);
  const whoopExpiresAt = useAuthStore((s) => s.whoopExpiresAt);
  const setWhoopStatus = useAuthStore((s) => s.setWhoopStatus);
  const signOut = useAuthStore((s) => s.signOut);

  const [message, setMessage] = useState<string | null>(null);
  const whoopParam = searchParams.get("whoop");

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => {
        setWhoopStatus(data.whoop?.connected ?? false, data.whoop?.expiresAt ?? null);
      })
      .catch(() => {});

    if (whoopParam === "connected") {
      setMessage("WHOOP connected successfully. Recovery sync is next on the roadmap.");
      setWhoopStatus(true);
    } else if (whoopParam === "setup") {
      setMessage("Add WHOOP_CLIENT_ID and WHOOP_CLIENT_SECRET to your environment to enable OAuth.");
    } else if (whoopParam === "error") {
      setMessage("WHOOP authorization failed. Try connecting again.");
    }
  }, [whoopParam, setWhoopStatus]);

  const handleDisconnectWhoop = async () => {
    await fetch("/api/auth/whoop/disconnect", { method: "POST" });
    setWhoopStatus(false, null);
    setMessage("WHOOP disconnected.");
  };

  const handleSignOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    signOut();
    setMessage("Signed out.");
  };

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-white/[0.08] bg-card/40 p-6">
        <h2 className="text-sm font-medium">Your session</h2>
        {user ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-lg font-light">{user.displayName}</p>
              {user.email && <p className="text-xs text-muted-foreground">{user.email}</p>}
              <p className="mt-1 text-[10px] text-muted-foreground">
                Signed in · ID {user.id.slice(0, 8)}…
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="mr-1.5 h-4 w-4" />
              Sign out
            </Button>
          </div>
        ) : (
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">
              Sign in before connecting WHOOP — tokens are tied to your session.
            </p>
            <Link
              href="/login"
              className={cn(buttonVariants({ size: "sm" }), "mt-4 bg-teal-600 text-white hover:bg-teal-500")}
            >
              Sign in
            </Link>
          </div>
        )}
      </section>

      <section className="rounded-xl border border-white/[0.08] bg-card/40 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/10">
            <Watch className="h-6 w-6 text-sky-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-medium">WHOOP</h2>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Connect your WHOOP account for recovery, HRV, strain, and sleep — overlaid on your lab
              timeline once sync is enabled.
            </p>

            {message && (
              <p className="mt-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-xs text-muted-foreground">
                {message}
              </p>
            )}

            {whoopConnected ? (
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  Connected
                </span>
                {whoopExpiresAt && (
                  <span className="text-[10px] text-muted-foreground">
                    Token expires {new Date(whoopExpiresAt).toLocaleString()}
                  </span>
                )}
                <Button variant="outline" size="sm" onClick={handleDisconnectWhoop}>
                  Disconnect
                </Button>
              </div>
            ) : user ? (
              <div className="mt-4">
                <a
                  href="/api/auth/whoop/authorize"
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    "inline-flex bg-sky-600 text-white hover:bg-sky-500"
                  )}
                >
                  <Link2 className="mr-1.5 h-4 w-4" />
                  Connect WHOOP
                </a>
              </div>
            ) : (
              <p className="mt-4 text-[10px] text-muted-foreground">Sign in required to connect</p>
            )}
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-dashed border-white/10 p-4 text-xs text-muted-foreground">
          <p className="font-medium text-foreground/80">Developer setup</p>
          <ol className="mt-2 list-inside list-decimal space-y-1">
            <li>Create an app at developer.whoop.com</li>
            <li>
              Redirect URI:{" "}
              <code className="text-teal-400/90">
                {typeof window !== "undefined"
                  ? `${window.location.origin}/api/auth/whoop/callback`
                  : "http://localhost:3000/api/auth/whoop/callback"}
              </code>
            </li>
            <li>
              Add <code className="text-teal-400/90">WHOOP_CLIENT_ID</code>,{" "}
              <code className="text-teal-400/90">WHOOP_CLIENT_SECRET</code>, and{" "}
              <code className="text-teal-400/90">NEXT_PUBLIC_APP_URL</code> to{" "}
              <code className="text-teal-400/90">.env.local</code>
            </li>
          </ol>
        </div>
      </section>
    </div>
  );
}
