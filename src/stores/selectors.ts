import {
  alertSeverityFor,
  compareByPriority,
  sortByPriority,
} from "@/lib/biomarkers/priority";
import { flagLabel } from "@/lib/biomarkers/reference-labels";
import type { BiomarkerReading, HealthAlert } from "@/types/health";

export function selectBiomarkerList(
  biomarkers: Record<string, BiomarkerReading>
): BiomarkerReading[] {
  return Object.values(biomarkers).sort((a, b) =>
    a.markerName.localeCompare(b.markerName)
  );
}

export function selectPriorityBiomarkerList(
  biomarkers: Record<string, BiomarkerReading>,
  limit = 3
): BiomarkerReading[] {
  return sortByPriority(Object.values(biomarkers).filter((b) => b.flag !== "normal")).slice(
    0,
    limit
  );
}

/** Out-of-range markers on latest panel, highest priority first */
export function selectAlerts(biomarkers: Record<string, BiomarkerReading>): HealthAlert[] {
  return Object.values(biomarkers)
    .filter((b) => b.flag !== "normal")
    .sort(compareByPriority)
    .map((b) => ({
      id: `alert-${b.id}`,
      title: `${b.markerName}: ${flagLabel(b.flag)}`,
      description: `Latest panel ${b.value} ${b.unit} (lab ref. ${b.referenceLow}–${b.referenceHigh})`,
      severity: alertSeverityFor(b),
      category: b.category,
      timestamp: b.date,
    }));
}
