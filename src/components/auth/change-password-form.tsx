"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

interface ChangePasswordFormProps {
  disabled?: boolean;
  submitLabel?: string;
  onSuccess?: () => void | Promise<void>;
}

export function ChangePasswordForm({
  disabled = false,
  submitLabel = "Update password",
  onSuccess,
}: ChangePasswordFormProps) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const supabaseReady = isSupabaseConfigured();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseReady || disabled) return;

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
      setPassword("");
      setConfirm("");
      await onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="new-password">New password</Label>
        <Input
          id="new-password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          minLength={6}
          required
          disabled={disabled || !supabaseReady}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="confirm-password">Confirm password</Label>
        <Input
          id="confirm-password"
          type="password"
          placeholder="••••••••"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
          minLength={6}
          required
          disabled={disabled || !supabaseReady}
        />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <Button
        type="submit"
        disabled={loading || disabled || !supabaseReady}
        className="w-full bg-teal-600 text-white hover:bg-teal-500 sm:w-auto"
      >
        {loading ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
