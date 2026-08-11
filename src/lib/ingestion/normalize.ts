import type { BiomarkerFlag } from "@/types/health";
import type { ParsedBiomarker } from "@/types/ingestion";
import { resolveMarker, slugifyMarker } from "./marker-catalog";

const UNIT_ALIASES: Record<string, string> = {
  "umol/l": "µmol/L",
  "μmol/l": "µmol/L",
  "µmol/l": "µmol/L",
  "mmol/l": "mmol/L",
  "mg/l": "mg/L",
  "g/l": "g/L",
  "%": "%",
  "iu/l": "IU/L",
  "u/l": "U/L",
  "x10e9/l": "×10⁹/L",
  "x10^9/l": "×10⁹/L",
  "10*9/l": "×10⁹/L",
  "10e9/l": "×10⁹/L",
  "10*12/l": "×10¹²/L",
  "10e12/l": "×10¹²/L",
};

export function normalizeUnit(unit: string): string {
  const key = unit.trim().toLowerCase().replace(/\s/g, "");
  return UNIT_ALIASES[key] ?? unit.trim();
}

export function flagFromRawLetter(letter?: string): BiomarkerFlag | null {
  if (!letter) return null;
  const c = letter.trim().toUpperCase().charAt(0);
  if (c === "N") return "normal";
  if (c === "H") return "high";
  if (c === "L") return "low";
  if (c === "*") return "critical";
  // LifeLabs "A" = abnormal — resolve from reference range
  if (c === "A") return null;
  return null;
}

export function flagFromRange(
  value: number,
  low: number,
  high: number
): BiomarkerFlag {
  if (value < low) return "low";
  if (value > high) return "high";
  return "normal";
}

export function normalizeParsedRow(raw: {
  markerName: string;
  value: number;
  unit: string;
  referenceLow: number;
  referenceHigh: number;
  rawFlag?: string;
  sourceLine?: string;
  confidence?: ParsedBiomarker["confidence"];
}): ParsedBiomarker {
  const { canonical, category } = resolveMarker(raw.markerName);
  const referenceLow = raw.referenceLow;
  const referenceHigh = raw.referenceHigh;
  const flag =
    flagFromRawLetter(raw.rawFlag) ?? flagFromRange(raw.value, referenceLow, referenceHigh);

  return {
    markerName: canonical,
    value: raw.value,
    unit: normalizeUnit(raw.unit),
    referenceLow,
    referenceHigh,
    flag,
    rawFlag: raw.rawFlag,
    category,
    confidence: raw.confidence ?? "high",
    sourceLine: raw.sourceLine,
  };
}

export function dedupeBiomarkers(rows: ParsedBiomarker[]): ParsedBiomarker[] {
  const byKey = new Map<string, ParsedBiomarker>();
  for (const row of rows) {
    const key = slugifyMarker(row.markerName);
    const existing = byKey.get(key);
    if (!existing || confidenceRank(row) > confidenceRank(existing)) {
      byKey.set(key, row);
    }
  }
  return Array.from(byKey.values());
}

function confidenceRank(row: ParsedBiomarker): number {
  return row.confidence === "high" ? 3 : row.confidence === "medium" ? 2 : 1;
}
