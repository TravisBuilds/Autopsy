"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { InterventionCard } from "@/components/cards/intervention-card";
import { InterventionForm } from "@/components/interventions/intervention-form";
import { Button } from "@/components/ui/button";
import { formatInterventionSince, isInterventionActive } from "@/lib/interventions/format";
import type { InterventionInput } from "@/lib/interventions/format";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { useAuthStore } from "@/stores/auth-store";
import { useHealthStore } from "@/stores/health-store";
import type { Intervention } from "@/types/health";

export function InterventionsDashboard() {
  const user = useAuthStore((s) => s.user);
  const interventions = useHealthStore((s) => s.interventions);
  const persistAddIntervention = useHealthStore((s) => s.persistAddIntervention);
  const persistUpdateIntervention = useHealthStore((s) => s.persistUpdateIntervention);
  const persistRemoveIntervention = useHealthStore((s) => s.persistRemoveIntervention);
  const cloudRequired = isSupabaseConfigured();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Intervention | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const active = interventions.filter((i) => isInterventionActive(i));
  const past = interventions.filter((i) => !isInterventionActive(i));
  const canAdd = !cloudRequired || Boolean(user);

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setError(null);
  };

  const handleSubmit = async (input: InterventionInput) => {
    if (cloudRequired && !user) {
      setError("Sign in to save interventions to your account.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      if (editing) {
        await persistUpdateIntervention(editing.id, input);
      } else {
        await persistAddIntervention(input);
      }
      closeForm();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save intervention");
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (id: string) => {
    if (cloudRequired && !user) {
      setError("Sign in to remove interventions from your account.");
      return;
    }
    setError(null);
    try {
      await persistRemoveIntervention(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to remove intervention");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Track medications and supplements with start dates — shown on your timeline.
          {cloudRequired && user && (
            <span className="text-teal-400/90"> Synced to your account.</span>
          )}
        </p>
        {!showForm && !editing && canAdd && (
          <Button
            size="sm"
            className="bg-teal-600 text-white hover:bg-teal-500"
            onClick={() => setShowForm(true)}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add intervention
          </Button>
        )}
      </div>

      {cloudRequired && !user && (
        <p className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-xs text-muted-foreground">
          <Link href="/login" className="text-teal-400 hover:underline">
            Sign in
          </Link>{" "}
          to save interventions to the database.
        </p>
      )}

      {error && (
        <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {error}
        </p>
      )}

      {(showForm || editing) && (
        <InterventionForm
          initial={editing}
          onCancel={closeForm}
          onSubmit={handleSubmit}
          saving={saving}
        />
      )}

      {interventions.length === 0 && !showForm ? (
        <div className="rounded-xl border border-dashed border-white/10 px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">No interventions logged yet.</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Example: Allopurinol · 100 mg · started April 2025
          </p>
          {canAdd && (
            <Button
              size="sm"
              className="mt-4 bg-teal-600 text-white hover:bg-teal-500"
              onClick={() => setShowForm(true)}
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Add your first
            </Button>
          )}
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <section>
              <h3 className="mb-3 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                Active ({active.length})
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {active.map((item, i) => (
                  <InterventionListItem
                    key={item.id}
                    intervention={item}
                    delay={i * 0.03}
                    onEdit={() => {
                      setShowForm(false);
                      setEditing(item);
                    }}
                    onDelete={() => {
                      if (confirm(`Remove ${item.name} from your log?`)) {
                        void handleRemove(item.id);
                      }
                    }}
                  />
                ))}
              </div>
            </section>
          )}

          {past.length > 0 && (
            <section>
              <h3 className="mb-3 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                Past
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {past.map((item, i) => (
                  <InterventionListItem
                    key={item.id}
                    intervention={item}
                    delay={i * 0.03}
                    onEdit={() => {
                      setShowForm(false);
                      setEditing(item);
                    }}
                    onDelete={() => {
                      if (confirm(`Remove ${item.name} from your log?`)) {
                        void handleRemove(item.id);
                      }
                    }}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function InterventionListItem({
  intervention,
  delay,
  onEdit,
  onDelete,
}: {
  intervention: Intervention;
  delay: number;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="group relative">
      <InterventionCard intervention={intervention} delay={delay} />
      <p className="mt-1 px-1 text-[10px] text-muted-foreground">
        Since {formatInterventionSince(intervention)}
      </p>
      <div className="absolute right-3 top-3 flex gap-1 opacity-0 transition group-hover:opacity-100">
        <button
          type="button"
          onClick={onEdit}
          className="rounded-md bg-background/80 p-1.5 text-muted-foreground hover:text-foreground"
          aria-label="Edit"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="rounded-md bg-background/80 p-1.5 text-muted-foreground hover:text-red-400"
          aria-label="Delete"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
