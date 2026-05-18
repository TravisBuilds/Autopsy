"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import {
  emptyInterventionForm,
  formValuesToInterventionInput,
  interventionToFormValues,
  type InterventionFormValues,
} from "@/lib/interventions/format";
import type { Intervention } from "@/types/health";

const TYPES: { value: Intervention["type"]; label: string }[] = [
  { value: "medication", label: "Medication" },
  { value: "supplement", label: "Supplement" },
  { value: "diet", label: "Diet" },
  { value: "exercise", label: "Exercise" },
  { value: "lifestyle", label: "Lifestyle" },
];

interface InterventionFormProps {
  initial?: Intervention | null;
  onSubmit: (values: ReturnType<typeof formValuesToInterventionInput>) => void | Promise<void>;
  onCancel: () => void;
  saving?: boolean;
}

export function InterventionForm({ initial, onSubmit, onCancel, saving = false }: InterventionFormProps) {
  const [values, setValues] = useState<InterventionFormValues>(
    initial ? interventionToFormValues(initial) : emptyInterventionForm()
  );
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof InterventionFormValues>(key: K, val: InterventionFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!values.name.trim()) {
      setError("Name is required (e.g. Allopurinol).");
      return;
    }
    if (!values.startDate) {
      setError("Start month is required.");
      return;
    }
    setError(null);
    await onSubmit(formValuesToInterventionInput(values));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-white/[0.08] bg-card/50 p-5">
      <p className="text-sm font-medium">
        {initial ? "Edit intervention" : "Add intervention"}
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="int-name">Name</Label>
          <Input
            id="int-name"
            placeholder="Allopurinol"
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="int-type">Type</Label>
          <Select
            id="int-type"
            value={values.type}
            onChange={(e) => set("type", e.target.value as Intervention["type"])}
          >
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="int-dosage">Dosage</Label>
          <Input
            id="int-dosage"
            placeholder="100 mg"
            value={values.dosage}
            onChange={(e) => set("dosage", e.target.value)}
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="int-frequency">Frequency (optional)</Label>
          <Input
            id="int-frequency"
            placeholder="Once daily"
            value={values.frequency}
            onChange={(e) => set("frequency", e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="int-start">Started</Label>
          <Input
            id="int-start"
            type="month"
            value={values.startDate}
            onChange={(e) => set("startDate", e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="int-end">Ended (optional)</Label>
          <Input
            id="int-end"
            type="month"
            value={values.endDate}
            onChange={(e) => set("endDate", e.target.value)}
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="int-notes">Notes (optional)</Label>
          <Textarea
            id="int-notes"
            placeholder="Prescribed for uric acid management"
            value={values.notes}
            onChange={(e) => set("notes", e.target.value)}
          />
        </div>

        <label className="flex items-center gap-2 sm:col-span-2">
          <input
            type="checkbox"
            checked={values.active}
            onChange={(e) => set("active", e.target.checked)}
            className="rounded border-white/20"
          />
          <span className="text-xs text-muted-foreground">Currently taking / active</span>
        </label>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          className="bg-teal-600 text-white hover:bg-teal-500"
          disabled={saving}
        >
          {saving ? "Saving…" : initial ? "Save changes" : "Add intervention"}
        </Button>
      </div>
    </form>
  );
}
