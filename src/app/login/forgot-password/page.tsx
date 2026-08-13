"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const supabaseReady = isSupabaseConfigured();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseReady) {
      setError("Supabase is not configured.");
      return;
    }
    if (!email.trim()) {
      setError("Enter your account email.");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          origin: window.location.origin,
        }),
      });

      let data: { error?: string } = {};
      const text = await res.text();
      if (text) {
        try {
          data = JSON.parse(text) as { error?: string };
        } catch {
          throw new Error("Unexpected server response. Try again in a moment.");
        }
      }

      if (!res.ok) throw new Error(data.error ?? "Could not send reset email");
      setMessage(
        "If an account exists for that email, we sent a reset link. Check your inbox and spam folder."
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Reset password" subtitle="We'll email you a secure link">
      {!supabaseReady && (
        <p className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs text-amber-200/90">
          Add Supabase env vars to enable password recovery.
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        {message && <p className="text-xs text-teal-400/90">{message}</p>}
        <Button
          type="submit"
          disabled={loading || !supabaseReady}
          className="w-full bg-teal-600 text-white hover:bg-teal-500"
        >
          {loading ? "Sending…" : "Send reset link"}
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        <Link href="/login" className="text-teal-400 hover:underline">
          Back to sign in
        </Link>
      </p>
    </AuthShell>
  );
}
