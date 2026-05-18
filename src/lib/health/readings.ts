import { slugifyMarker } from "@/lib/ingestion/marker-catalog";
import type { ParsedBiomarker, SessionReading } from "@/types/ingestion";

export function toSessionReadings(parsed: ParsedBiomarker[]): SessionReading[] {
  return parsed.map((row) => ({
    markerId: slugifyMarker(row.markerName),
    markerName: row.markerName,
    category: row.category,
    value: row.value,
    unit: row.unit,
    referenceLow: row.referenceLow,
    referenceHigh: row.referenceHigh,
    flag: row.flag,
  }));
}
