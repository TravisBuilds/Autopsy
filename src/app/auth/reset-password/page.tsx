"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const supabaseReady = isSupabaseConfigured();

  useEffect(() => {
    if (!supabaseReady) {
      setCheckingSession(false);
      return;
    }

    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSessionReady(Boolean(session));
      setCheckingSession(false);
      if (!session) {
        setError("Reset link expired or invalid. Request a new one.");
      }
    });
  }, [supabaseReady]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseReady || !sessionReady) return;

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      router.push("/?reset=success");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="New password" subtitle="Choose a password for your account">
      {checkingSession ? (
        <p className="mt-6 text-center text-xs text-muted-foreground">Verifying reset link…</p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              minLength={6}
              required
              disabled={!sessionReady}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm">Confirm password</Label>
            <Input
              id="confirm"
              type="password"
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              minLength={6}
              required
              disabled={!sessionReady}
            />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <Button
            type="submit"
            disabled={loading || !sessionReady || !supabaseReady}
            className="w-full bg-teal-600 text-white hover:bg-teal-500"
          >
            {loading ? "Saving…" : "Update password"}
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-xs text-muted-foreground">
        <Link href="/login/forgot-password" className="text-teal-400 hover:underline">
          Request a new reset link
        </Link>
      </p>
    </AuthShell>
  );
}
