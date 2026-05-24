"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Dna } from "lucide-react";
import { HealthCard } from "@/components/cards/health-card";
import { GenomeImportZone } from "@/components/genome/genome-import-zone";
import { VariantCard } from "@/components/genome/variant-card";
import { fetchGenomeProfile, importGenomeJson } from "@/lib/genome/api-client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { useAuthStore } from "@/stores/auth-store";
import type { GenomeProfile } from "@/types/genome";

export function GenomePanel() {
  const user = useAuthStore((s) => s.user);
  const cloudEnabled = isSupabaseConfigured() && Boolean(user);

  const [profile, setProfile] = useState<GenomeProfile>({ import: null, variants: [] });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasImport = Boolean(profile.import);

  const loadProfile = useCallback(async () => {
    if (!cloudEnabled) {
      setProfile({ import: null, variants: [] });
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await fetchGenomeProfile();
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load genome data");
    } finally {
      setLoading(false);
    }
  }, [cloudEnabled]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const handleImport = useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file) {
        setError("Select a JSON file to import.");
        return;
      }
      if (!cloudEnabled) {
        setError("Sign in to import genome data.");
        return;
      }

      setUploading(true);
      setError(null);
      try {
        const data = await importGenomeJson({ file });
        setProfile(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Import failed");
      } finally {
        setUploading(false);
      }
    },
    [cloudEnabled]
  );

  const importZone = cloudEnabled ? (
    <GenomeImportZone
      compact={hasImport}
      uploading={uploading}
      dragOver={dragOver}
      onDragOver={(e) => {
        e.preventDefault();
        if (!uploading) setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        if (!uploading) {
          const files = Array.from(e.dataTransfer.files).filter(
            (file) =>
              file.type === "application/json" ||
              file.name.toLowerCase().endsWith(".json")
          );
          void handleImport(files);
        }
      }}
      onFiles={(files) => void handleImport(files)}
    />
  ) : null;

  return (
    <div className="space-y-6">
      <HealthCard>
        <p className="text-sm text-muted-foreground">
          Import pre-processed genome JSON from your WGS pipeline. Raw sequencing files stay
          outside Pulse Check; only interpreted variants are stored in your account.
        </p>

        {!isSupabaseConfigured() && (
          <p className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs text-amber-200/90">
            Add Supabase env vars to enable genome sync.
          </p>
        )}

        {isSupabaseConfigured() && !user && (
          <p className="mt-4 text-sm text-muted-foreground">
            <Link href="/login" className="text-teal-400 hover:underline">
              Sign in
            </Link>{" "}
            to upload and sync genome variants.
          </p>
        )}
      </HealthCard>

      {error && (
        <p className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      {cloudEnabled && !hasImport && !loading && importZone}

      {cloudEnabled && !loading && profile.import && (
        <HealthCard>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Current import
              </p>
              <h3 className="mt-1 text-lg font-medium">
                {profile.import.variantCount} variants
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {profile.import.sourceFileName ?? "Imported genome JSON"}
                {profile.import.lastInterpretedAt
                  ? ` · interpreted ${profile.import.lastInterpretedAt}`
                  : ""}
              </p>
            </div>
            <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-muted-foreground ring-1 ring-white/10">
              v{profile.import.interpretationVersion}
            </span>
          </div>
        </HealthCard>
      )}

      {cloudEnabled && loading && (
        <HealthCard>
          <p className="text-sm text-muted-foreground">Loading genome profile…</p>
        </HealthCard>
      )}

      {cloudEnabled && !loading && profile.variants.length > 0 && (
        <HealthCard>
          <div className="mb-4 flex items-center gap-2">
            <Dna className="h-4 w-4 text-teal-400" />
            <h3 className="text-sm font-medium">Top variants by importance</h3>
          </div>

          <div className="space-y-3">
            {profile.variants.slice(0, 12).map((variant) => (
              <VariantCard key={variant.id} variant={variant} />
            ))}
          </div>
        </HealthCard>
      )}

      {cloudEnabled && !loading && !profile.import && !error && (
        <HealthCard>
          <p className="text-sm text-muted-foreground">
            No genome data yet. Import a JSON file to get started.
          </p>
        </HealthCard>
      )}

      {cloudEnabled && hasImport && !loading && importZone}
    </div>
  );
}
