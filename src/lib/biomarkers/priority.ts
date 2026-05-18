import type { BiomarkerCategory, BiomarkerFlag, BiomarkerReading } from "@/types/health";

const FLAG_WEIGHT: Record<BiomarkerFlag, number> = {
  critical: 1000,
  high: 500,
  low: 480,
  normal: 0,
};

const CATEGORY_WEIGHT: Record<BiomarkerCategory, number> = {
  cardiovascular: 90,
  metabolic: 75,
  inflammation: 70,
  hematology: 55,
  kidney: 50,
  liver: 45,
  hormones: 40,
  vitamins: 25,
};

/** Lipids, urate, glycemic, inflammation — surfaced first on Command Center */
const HIGH_PRIORITY_MARKERS: { match: RegExp; flag?: BiomarkerFlag }[] = [
  { match: /^ldl\b|ldl cholesterol/i },
  { match: /uric acid|^urate\b/i },
  { match: /total cholesterol/i },
  { match: /triglyceride/i },
  { match: /non.?hdl/i },
  { match: /apolipoprotein|^apo\s*b/i },
  { match: /^hscrp\b|high.?sensitivity c/i },
  { match: /^hba1c|hemoglobin a1c/i },
  { match: /^glucose\b/i },
  { match: /hdl cholesterol/i, flag: "low" },
];

export function referenceDeviationRatio(b: BiomarkerReading): number {
  if (b.flag === "normal") return 0;

  const span = b.referenceHigh - b.referenceLow;
  if (span > 0) {
    if (b.value > b.referenceHigh) return (b.value - b.referenceHigh) / span;
    if (b.value < b.referenceLow) return (b.referenceLow - b.value) / span;
    return 0;
  }

  if (b.flag === "high" && b.referenceHigh > 0) {
    return (b.value - b.referenceHigh) / b.referenceHigh;
  }
  if (b.flag === "low" && b.referenceLow > 0) {
    return (b.referenceLow - b.value) / b.referenceLow;
  }
  return 0.5;
}

function markerImportanceBoost(markerName: string, flag: BiomarkerFlag): number {
  const name = markerName.toLowerCase();
  for (const { match, flag: requiredFlag } of HIGH_PRIORITY_MARKERS) {
    if (!match.test(name)) continue;
    if (requiredFlag && flag !== requiredFlag) continue;
    return 200;
  }
  return 0;
}

/** Higher = more important for Command Center */
export function priorityScore(b: BiomarkerReading): number {
  if (b.flag === "normal") return 0;

  const deviation = referenceDeviationRatio(b);
  const deviationScore = Math.min(deviation, 3) * 120;
  const worsening =
    b.changePercent !== undefined && b.flag === "high" && b.changePercent > 0
      ? Math.min(b.changePercent, 50) * 2
      : b.changePercent !== undefined && b.flag === "low" && b.changePercent < 0
        ? Math.min(Math.abs(b.changePercent), 50) * 2
        : 0;

  return (
    FLAG_WEIGHT[b.flag] +
    CATEGORY_WEIGHT[b.category] +
    markerImportanceBoost(b.markerName, b.flag) +
    deviationScore +
    worsening
  );
}

export function compareByPriority(a: BiomarkerReading, b: BiomarkerReading): number {
  const diff = priorityScore(b) - priorityScore(a);
  if (diff !== 0) return diff;
  return a.markerName.localeCompare(b.markerName);
}

export function sortByPriority(biomarkers: BiomarkerReading[]): BiomarkerReading[] {
  return [...biomarkers].sort(compareByPriority);
}

export function selectPriorityBiomarkers(
  biomarkers: BiomarkerReading[],
  limit = 3
): BiomarkerReading[] {
  return sortByPriority(biomarkers.filter((b) => b.flag !== "normal")).slice(0, limit);
}

export function alertSeverityFor(b: BiomarkerReading): "info" | "warning" | "critical" {
  if (b.flag === "critical") return "critical";
  if (b.flag === "normal") return "info";
  const score = priorityScore(b);
  if (score >= 700 || referenceDeviationRatio(b) >= 0.5) return "warning";
  return "warning";
}
