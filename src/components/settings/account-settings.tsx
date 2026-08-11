"use client";

import { useState } from "react";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { ChangePasswordForm } from "@/components/auth/change-password-form";
import { Button } from "@/components/ui/button";
import { signOutClient } from "@/lib/auth/sign-out-client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { useAuthStore } from "@/stores/auth-store";

export function AccountSettings() {
  const user = useAuthStore((s) => s.user);
  const [message, setMessage] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  const supabaseReady = isSupabaseConfigured();

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOutClient();
      window.location.href = "/login";
    } finally {
      setSigningOut(false);
    }
  };

  if (!user) {
    return (
      <p className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-muted-foreground">
        Sign in to manage your account.{" "}
        <Link href="/login" className="text-teal-400 hover:underline">
          Go to sign in
        </Link>
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-white/[0.08] bg-card/40 p-6">
        <h2 className="text-sm font-medium">Profile</h2>
        <p className="mt-3 text-lg font-light">{user.displayName}</p>
        {user.email && <p className="text-xs text-muted-foreground">{user.email}</p>}
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => void handleSignOut()}
          disabled={signingOut}
        >
          <LogOut className="mr-1.5 h-4 w-4" />
          {signingOut ? "Signing out…" : "Sign out"}
        </Button>
      </section>

      {supabaseReady && (
        <section className="rounded-xl border border-white/[0.08] bg-card/40 p-6">
          <h2 className="text-sm font-medium">Change password</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Update your password while signed in. No email required.
          </p>
          <div className="mt-4 max-w-md">
            <ChangePasswordForm
              onSuccess={() => setMessage("Password updated successfully.")}
            />
          </div>
          {message && <p className="mt-3 text-xs text-teal-400/90">{message}</p>}
          <p className="mt-4 text-xs text-muted-foreground">
            Forgot your current password?{" "}
            <Link href="/login/forgot-password" className="text-teal-400 hover:underline">
              Email a reset link
            </Link>
          </p>
        </section>
      )}
    </div>
  );
}
