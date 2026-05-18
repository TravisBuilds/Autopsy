"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { InterventionCard } from "@/components/cards/intervention-card";
import { InterventionForm } from "@/components/interventions/intervention-form";
import { Button } from "@/components/ui/button";
import { formatInterventionSince, isInterventionActive } from "@/lib/interventions/format";
import { useHealthStore } from "@/stores/health-store";
import type { Intervention } from "@/types/health";

export function InterventionsDashboard() {
  const interventions = useHealthStore((s) => s.interventions);
  const addIntervention = useHealthStore((s) => s.addIntervention);
  const updateIntervention = useHealthStore((s) => s.updateIntervention);
  const removeIntervention = useHealthStore((s) => s.removeIntervention);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Intervention | null>(null);

  const active = interventions.filter((i) => isInterventionActive(i));
  const past = interventions.filter((i) => !isInterventionActive(i));

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Track medications and supplements with start dates — shown on your timeline.
        </p>
        {!showForm && !editing && (
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

      {(showForm || editing) && (
        <InterventionForm
          initial={editing}
          onCancel={closeForm}
          onSubmit={(input) => {
            if (editing) {
              updateIntervention(editing.id, input);
            } else {
              addIntervention(input);
            }
            closeForm();
          }}
        />
      )}

      {interventions.length === 0 && !showForm ? (
        <div className="rounded-xl border border-dashed border-white/10 px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">No interventions logged yet.</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Example: Allopurinol · 100 mg · started April 2025
          </p>
          <Button
            size="sm"
            className="mt-4 bg-teal-600 text-white hover:bg-teal-500"
            onClick={() => setShowForm(true)}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add your first
          </Button>
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
                        removeIntervention(item.id);
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
                        removeIntervention(item.id);
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
