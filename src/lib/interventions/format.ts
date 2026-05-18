import { formatTimelineDate, normalizeSessionDate } from "@/lib/biomarkers/dates";
import type { Intervention } from "@/types/health";

const TYPE_LABELS: Record<Intervention["type"], string> = {
  medication: "Medication",
  supplement: "Supplement",
  diet: "Diet",
  exercise: "Exercise",
  lifestyle: "Lifestyle",
};

export function interventionTypeLabel(type: Intervention["type"]): string {
  return TYPE_LABELS[type];
}

export function formatInterventionSummary(i: Intervention): string {
  const parts = [i.name];
  if (i.dosage) parts.push(i.dosage);
  if (i.frequency) parts.push(i.frequency);
  return parts.join(" · ");
}

export function formatInterventionTimelineLabel(i: Intervention): string {
  const type = interventionTypeLabel(i.type);
  const dose = i.dosage ? ` · ${i.dosage}` : "";
  return `Started ${i.name}${dose} (${type})`;
}

export function formatInterventionSince(i: Intervention): string {
  return formatTimelineDate(normalizeSessionDate(i.startDate));
}

export function isInterventionActive(i: Intervention, asOf = new Date()): boolean {
  if (!i.active) return false;
  if (!i.endDate) return true;
  const end = normalizeSessionDate(i.endDate);
  const [y, m, d] = end.split("-").map(Number);
  const endMs = Date.UTC(y, m - 1, d);
  return asOf.getTime() <= endMs;
}

export type InterventionFormValues = {
  name: string;
  type: Intervention["type"];
  dosage: string;
  frequency: string;
  startDate: string;
  endDate: string;
  notes: string;
  active: boolean;
};

export function interventionToFormValues(i: Intervention): InterventionFormValues {
  return {
    name: i.name,
    type: i.type,
    dosage: i.dosage ?? "",
    frequency: i.frequency ?? "",
    startDate: toMonthInputValue(i.startDate),
    endDate: i.endDate ? toMonthInputValue(i.endDate) : "",
    notes: i.notes ?? "",
    active: i.active,
  };
}

export function emptyInterventionForm(): InterventionFormValues {
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  return {
    name: "",
    type: "medication",
    dosage: "",
    frequency: "",
    startDate: month,
    endDate: "",
    notes: "",
    active: true,
  };
}

/** `type="month"` value YYYY-MM → stored date YYYY-MM-01 */
export type InterventionInput = Omit<Intervention, "id" | "createdAt" | "updatedAt">;

export function formValuesToInterventionInput(values: InterventionFormValues): InterventionInput {
  const startDate = monthInputToDateKey(values.startDate);
  const endDate = values.endDate.trim() ? monthInputToDateKey(values.endDate) : undefined;
  let active = values.active;

  if (endDate) {
    const [y, m, d] = endDate.split("-").map(Number);
    if (Date.now() > Date.UTC(y, m - 1, d)) active = false;
  }

  return {
    name: values.name.trim(),
    type: values.type,
    dosage: values.dosage.trim() || undefined,
    frequency: values.frequency.trim() || undefined,
    startDate,
    endDate,
    notes: values.notes.trim() || undefined,
    active,
  };
}

function toMonthInputValue(dateKey: string): string {
  const normalized = normalizeSessionDate(dateKey);
  return normalized.slice(0, 7);
}

function monthInputToDateKey(month: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(month)) return month;
  if (/^\d{4}-\d{2}$/.test(month)) return `${month}-01`;
  return normalizeSessionDate(month);
}
