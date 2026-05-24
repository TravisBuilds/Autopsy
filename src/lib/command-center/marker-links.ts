import { resolveMarker } from "@/lib/ingestion/marker-catalog";
import type { BiomarkerReading, WearableSnapshot } from "@/types/health";
import type { GenomeVariant } from "@/types/genome";

/** Maps genome `linked_biomarkers` labels to lab catalog canonical names. */
const GENOME_TO_CANONICAL: Record<string, string[]> = {
  "LDL Cholesterol": ["LDL Cholesterol"],
  "Non-HDL Cholesterol": ["Total Cholesterol"],
  "ApoB": ["ApoB"],
  "Triglycerides": ["Triglycerides"],
  "Fasting Glucose": ["Glucose"],
  "Hemoglobin A1c": ["HbA1c"],
  "Urate": ["Urate"],
  "Creatinine": ["Creatinine"],
  "eGFR": ["eGFR"],
  "Urine ACR": [],
  "ALT": ["ALT"],
  "GGT": ["GGT"],
  "Total Bilirubin": ["Bilirubin"],
  "CRP": ["hsCRP"],
  "WBC": ["WBC"],
  "Neutrophils": ["Neutrophils"],
  Hemoglobin: ["Hemoglobin"],
  Ferritin: ["Ferritin"],
  "Vitamin B12": ["Vitamin B12"],
};

const WEARABLE_METRIC_IDS = new Set([
  "Sleep Score",
  "HRV",
  "Recovery Score",
  "Strain",
]);

export function isWearableLinkedMarker(name: string): boolean {
  return WEARABLE_METRIC_IDS.has(name.trim());
}

export function canonicalizeGenomeMarker(label: string): string[] {
  const trimmed = label.trim();
  if (GENOME_TO_CANONICAL[trimmed]) return GENOME_TO_CANONICAL[trimmed];
  const resolved = resolveMarker(trimmed);
  return [resolved.canonical];
}

export function labReadingMatchesGenomeLabel(
  reading: BiomarkerReading,
  genomeLabel: string
): boolean {
  const readingCanonical = resolveMarker(reading.markerName).canonical.toLowerCase();
  const targets = canonicalizeGenomeMarker(genomeLabel).map((n) => n.toLowerCase());
  if (targets.includes(readingCanonical)) return true;
  return targets.some(
    (target) =>
      readingCanonical.includes(target) ||
      target.includes(readingCanonical) ||
      reading.markerName.toLowerCase().includes(target)
  );
}

export interface WearableMetricReading {
  id: string;
  biomarkerName: string;
  value: number;
  unit: string;
  flag: "suboptimal" | "normal";
}

export function wearableMetricsFromSnapshot(
  snapshot: WearableSnapshot
): WearableMetricReading[] {
  const metrics: WearableMetricReading[] = [];

  if (snapshot.recovery > 0) {
    metrics.push({
      id: "wearable-recovery",
      biomarkerName: "Recovery Score",
      value: snapshot.recovery,
      unit: "%",
      flag: snapshot.recovery < 34 ? "suboptimal" : "normal",
    });
  }

  if (snapshot.hrv > 0) {
    metrics.push({
      id: "wearable-hrv",
      biomarkerName: "HRV",
      value: snapshot.hrv,
      unit: "ms",
      flag: snapshot.hrv < 40 ? "suboptimal" : "normal",
    });
  }

  if (snapshot.sleepScore > 0) {
    metrics.push({
      id: "wearable-sleep",
      biomarkerName: "Sleep Score",
      value: snapshot.sleepScore,
      unit: "%",
      flag: snapshot.sleepScore < 70 ? "suboptimal" : "normal",
    });
  }

  if (snapshot.strain > 0) {
    metrics.push({
      id: "wearable-strain",
      biomarkerName: "Strain",
      value: snapshot.strain,
      unit: "",
      flag: snapshot.strain > 14 ? "suboptimal" : "normal",
    });
  }

  return metrics;
}

export function wearableMatchesGenomeLabel(
  metric: WearableMetricReading,
  genomeLabel: string
): boolean {
  return metric.biomarkerName.toLowerCase() === genomeLabel.trim().toLowerCase();
}

export function variantsLinkingToLabMarker(
  variants: GenomeVariant[],
  reading: BiomarkerReading
): GenomeVariant[] {
  return variants.filter((variant) =>
    variant.linkedBiomarkers.some((label) => labReadingMatchesGenomeLabel(reading, label))
  );
}

export function variantsLinkingToWearableMetric(
  variants: GenomeVariant[],
  metric: WearableMetricReading
): GenomeVariant[] {
  return variants.filter((variant) =>
    variant.linkedBiomarkers.some((label) => wearableMatchesGenomeLabel(metric, label))
  );
}
