"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { ChangePasswordForm } from "@/components/auth/change-password-form";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [sessionReady, setSessionReady] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabaseReady = isSupabaseConfigured();

  useEffect(() => {
    if (!supabaseReady) {
      setCheckingSession(false);
      return;
    }

    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN" || event === "INITIAL_SESSION") {
        setSessionReady(Boolean(session));
        setCheckingSession(false);
        if (!session) {
          setError("Reset link expired or invalid. Request a new one.");
        } else {
          setError(null);
        }
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSessionReady(Boolean(session));
      setCheckingSession(false);
      if (!session) {
        setError("Reset link expired or invalid. Request a new one.");
      }
    });

    return () => subscription.unsubscribe();
  }, [supabaseReady]);

  return (
    <AuthShell title="New password" subtitle="Choose a password for your account">
      {!supabaseReady && (
        <p className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs text-amber-200/90">
          Add Supabase env vars to enable password recovery.
        </p>
      )}

      {checkingSession ? (
        <p className="mt-6 text-center text-xs text-muted-foreground">Verifying reset link…</p>
      ) : (
        <>
          {error && !sessionReady && (
            <p className="mt-4 text-center text-xs text-red-400">{error}</p>
          )}
          <div className="mt-6">
            <ChangePasswordForm
              disabled={!sessionReady}
              onSuccess={async () => {
                router.push("/?reset=success");
                router.refresh();
              }}
            />
          </div>
        </>
      )}

      <p className="mt-6 text-center text-xs text-muted-foreground">
        <Link href="/login/forgot-password" className="text-teal-400 hover:underline">
          Request a new reset link
        </Link>
        {" · "}
        <Link href="/login" className="text-teal-400 hover:underline">
          Back to sign in
        </Link>
      </p>
    </AuthShell>
  );
}
