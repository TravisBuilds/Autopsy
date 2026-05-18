"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { APP_DESCRIPTION, APP_NAME } from "@/lib/brand";
import { useAuthStore } from "@/stores/auth-store";

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setError("Enter your name to continue.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: displayName.trim(), email: email.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Sign in failed");

      setUser({
        id: data.user.id,
        displayName: data.user.displayName,
        email: data.user.email,
        createdAt: new Date().toISOString(),
      });
      router.push("/wearables");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-card/50 p-8">
        <div className="flex flex-col items-center text-center">
          <Logo size={64} priority />
          <h1 className="mt-4 text-2xl font-light tracking-tight">{APP_NAME}</h1>
          <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Sign in
          </p>
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">{APP_DESCRIPTION}</p>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Health data stays in your browser until cloud sync ships.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Display name</Label>
            <Input
              id="name"
              placeholder="Travis"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              autoComplete="name"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email (optional)</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 text-white hover:bg-teal-500"
          >
            {loading ? "Signing in…" : "Continue"}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link href="/" className="text-teal-400 hover:underline">
            Skip to dashboard
          </Link>
        </p>
      </div>
    </div>
  );
}
