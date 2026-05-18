import type { BiomarkerCategory } from "@/types/health";
import type { LabParseResult, ParsedBiomarker } from "@/types/ingestion";
import { extractSessionDate } from "./extract-session-date";
import { dedupeBiomarkers, normalizeParsedRow } from "./normalize";

/** LifeLabs OSCAR: WBC  3.8  A  4.0-10.0  10*9/L  2026-03-11 16:40:22  F */
const LIFELABS_RANGE_ROW =
  /^(.+?)\s+([\d.]+)\s+([ANHL*])\s+([\d.]+)\s*-\s*([\d.]+)\s+(\S+)\b/i;

/** LifeLabs: HDL Cholesterol  1.33  N  >0.99  mmol/L  ... */
const LIFELABS_GT_ROW = /^(.+?)\s+([\d.]+)\s+([ANHL*])\s+>\s*([\d.]+)\s+(\S+)\b/i;

/** LifeLabs: Triglycerides  2.38  A  <2.21  mmol/L  ... */
const LIFELABS_LT_ROW = /^(.+?)\s+([\d.]+)\s+([ANHL*])\s+<\s*([\d.]+)\s+(\S+)\b/i;

/** Legacy compact: LDL Cholesterol 4.31 A 1.50-3.40 mmol/L */
const COMPACT_ROW =
  /^(.+?)\s+([\d.]+)\s+([ANHL*]?)\s+([\d.]+)\s*[-–—]\s*([\d.<>]+)\s+([^\s]+(?:\/[^\s]+)?)\s*$/i;

/** Parenthetical range: Glucose 5.4 (3.9-5.5) mmol/L */
const PAREN_RANGE =
  /^(.+?)\s+([\d.]+)\s+\(\s*([\d.]+)\s*[-–—]\s*([\d.<>]+)\s*\)\s*([^\s]+(?:\/[^\s]+)?)\s*$/i;

const LAB_PATTERNS = [/lifelabs/i, /dynacare/i, /quest diagnostics/i, /labcorp/i];

const SKIP_LINE =
  /^(test name|general information|page \d|created by|version:|detail results|patient name|date of birth|age:|health #|accession|requesting client|hours pc:|this and the preceding|see \d|therapeutic target|the optimal|non hdl-cholesterol is calculated|end of report|lipids$|hematology panel$|general$|chem\d+$|haem\d+$)/i;

const SKIP_MARKER =
  /^(test name\(s\)|result|abn|reference range|units|status|general information)/i;

export function parseLabReportText(text: string): LabParseResult {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.replace(/\s{2,}/g, "  ").trim())
    .filter(Boolean);

  const parseErrors: string[] = [];
  const raw: ParsedBiomarker[] = [];

  for (const line of lines) {
    if (line.length < 6 || line.length > 280) continue;
    if (SKIP_LINE.test(line) || SKIP_MARKER.test(line)) continue;

    const parsed = tryParseLine(line);
    if (parsed) raw.push(parsed);
  }

  const biomarkers = dedupeBiomarkers(raw);
  const sessionDate = extractSessionDate(text);
  const labName = extractLabName(text);
  const categories = [...new Set(biomarkers.map((b) => b.category))] as BiomarkerCategory[];

  if (biomarkers.length === 0) {
    parseErrors.push(
      "No biomarkers detected. Ensure the PDF contains tabular results (e.g. LifeLabs format)."
    );
  }

  return {
    biomarkers,
    sessionDate,
    labName,
    categories,
    rawLineCount: lines.length,
    parseErrors,
  };
}

function tryParseLine(line: string): ParsedBiomarker | null {
  const collapsed = line.replace(/\s{2,}/g, " ").trim();

  let m = line.match(LIFELABS_RANGE_ROW) ?? collapsed.match(LIFELABS_RANGE_ROW);
  if (m && isValidUnit(m[6])) {
    return normalizeParsedRow({
      markerName: cleanMarkerName(m[1]),
      value: parseFloat(m[2]),
      rawFlag: m[3],
      referenceLow: parseFloat(m[4]),
      referenceHigh: parseFloat(m[5]),
      unit: m[6],
      sourceLine: line,
      confidence: "high",
    });
  }

  m = line.match(LIFELABS_GT_ROW) ?? collapsed.match(LIFELABS_GT_ROW);
  if (m && isValidUnit(m[5])) {
    const bound = parseFloat(m[4]);
    return normalizeParsedRow({
      markerName: cleanMarkerName(m[1]),
      value: parseFloat(m[2]),
      rawFlag: m[3],
      referenceLow: bound,
      referenceHigh: bound * 3,
      unit: m[5],
      sourceLine: line,
      confidence: "high",
    });
  }

  m = line.match(LIFELABS_LT_ROW) ?? collapsed.match(LIFELABS_LT_ROW);
  if (m && isValidUnit(m[5])) {
    const bound = parseFloat(m[4]);
    return normalizeParsedRow({
      markerName: cleanMarkerName(m[1]),
      value: parseFloat(m[2]),
      rawFlag: m[3],
      referenceLow: 0,
      referenceHigh: bound,
      unit: m[5],
      sourceLine: line,
      confidence: "high",
    });
  }

  m = collapsed.match(COMPACT_ROW);
  if (m) {
    return normalizeParsedRow({
      markerName: cleanMarkerName(m[1]),
      value: parseFloat(m[2]),
      rawFlag: m[3]?.trim(),
      referenceLow: parseFloat(m[4]),
      referenceHigh: parseUpperBound(m[5]),
      unit: m[6],
      sourceLine: line,
      confidence: "high",
    });
  }

  m = collapsed.match(PAREN_RANGE);
  if (m) {
    return normalizeParsedRow({
      markerName: cleanMarkerName(m[1]),
      value: parseFloat(m[2]),
      referenceLow: parseFloat(m[3]),
      referenceHigh: parseUpperBound(m[4]),
      unit: m[5],
      sourceLine: line,
      confidence: "high",
    });
  }

  return null;
}

function cleanMarkerName(name: string): string {
  return name.replace(/\s{2,}/g, " ").trim();
}

function isValidUnit(unit: string): boolean {
  const u = unit.trim();
  if (!u || /^\d{4}-\d{2}-\d{2}/.test(u)) return false;
  return true;
}

function parseUpperBound(s: string): number {
  const cleaned = s.replace(/[<>]/g, "").trim();
  return parseFloat(cleaned) || 0;
}

function extractLabName(text: string): string | null {
  for (const pattern of LAB_PATTERNS) {
    const m = text.match(pattern);
    if (m) return m[0];
  }
  return null;
}
