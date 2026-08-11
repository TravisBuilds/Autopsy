import type { BiomarkerCategory } from "@/types/health";
import type { LabParseResult, ParsedBiomarker } from "@/types/ingestion";
import { extractSessionDate } from "./extract-session-date";
import { dedupeBiomarkers, normalizeParsedRow } from "./normalize";

/** LifeLabs OSCAR: WBC  3.8  A  4.0-10.0  10*9/L  2026-03-11 16:40:22  F */
const LIFELABS_RANGE_ROW =
  /^(.+?)\s+([\d.]+)\s+([ANHL*])\s+([\d.]+)\s*-\s*([\d.]+)\s+(\S+)\b/i;

/** Excelleris patient report: Cholesterol A 6.42 2.00-5.19 mmol/L (flag before value) */
const EXCELLERIS_FLAG_RANGE =
  /^(.+?)\s+([ANHL*])\s+([\d.]+)\s+([\d.]+)\s*-\s*([\d.]+)\s+(\S+)\s*$/i;

/** Excelleris: Triglycerides A 2.91 <2.21 mmol/L */
const EXCELLERIS_FLAG_LT =
  /^(.+?)\s+([ANHL*])\s+([\d.]+)\s+<\s*([\d.]+)\s+(\S+)\s*$/i;

/** Excelleris: Glucose Fasting 5.2 3.3-5.5 mmol/L */
const EXCELLERIS_RANGE =
  /^(.+?)\s+([\d.]+)\s+([\d.]+)\s*-\s*([\d.]+)\s+(\S+)\s*$/i;

/** Excelleris: HDL Cholesterol 1.38 >0.99 mmol/L */
const EXCELLERIS_GT = /^(.+?)\s+([\d.]+)\s+>\s*([\d.]+)\s+(\S+)\s*$/i;

/** Excelleris: Gamma GT 39 <65 U/L */
const EXCELLERIS_LT = /^(.+?)\s+([\d.]+)\s+<\s*([\d.]+)\s+(\S+)\s*$/i;

/** Excelleris: ACR (Microalbumin/Creatinine Ratio) <1.0 <2.0 mg/mmol */
const EXCELLERIS_LT_VALUE =
  /^(.+?)\s+<([\d.]+)\s+<\s*([\d.]+)\s+(\S+)\s*$/i;

/** Excelleris: Chol/HDL (Risk Ratio) 4.65 <4.9 */
const EXCELLERIS_RATIO_LT = /^(.+?)\s+([\d.]+)\s+<\s*([\d.]+)\s*$/i;

/** Value + unit only: Vitamin B12 348 pmol/L */
const VALUE_UNIT_ONLY = /^(.+?)\s+([\d.]+)\s+(\S+(?:\/\S+)?)\s*$/i;

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
  /^(test name|test flag|general information|general comments|page \d|created by|version:|detail results|patient:|patient name|date of birth|age:|health #|phn:|accession|lab no:|patient id:|ordered by:|reported to:|reported by:|telephone:|toll free:|fax:|printed on:|hours after meal|hours pc:|final results|this and the preceding|see \d|therapeutic target|the optimal|non hdl-cholesterol is calculated|end of report|lipids$|hematology panel$|general$|general chemistry$|random urine chemistry$|biochemical investigation|effective july|refer to \d|note:|note to |chem\d+$|haem\d+$|deficiency unlikely|deficiency is possible|consistent with deficiency|will replace reference|no reference range|-- \d+ of \d+ --|^\d{1,2}-\d{2,3} pmol\/l|^>\s*\d|^<\s*\d|^\d{1,2}-\d{2,3} pmol|^with |=>)/i;

const SKIP_MARKER =
  /^(test name\(s\)|result|abn|reference range|units|status|general information)/i;

export function parseLabReportText(text: string): LabParseResult {
  const lines = coalesceSplitResultLines(
    text
      .split(/\r?\n/)
      .map((l) => l.replace(/\s{2,}/g, "  ").trim())
      .filter(Boolean)
  );

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

  let m = line.match(EXCELLERIS_FLAG_RANGE) ?? collapsed.match(EXCELLERIS_FLAG_RANGE);
  if (m && isValidUnit(m[6])) {
    return normalizeParsedRow({
      markerName: cleanMarkerName(m[1]),
      value: parseFloat(m[3]),
      rawFlag: m[2],
      referenceLow: parseFloat(m[4]),
      referenceHigh: parseFloat(m[5]),
      unit: m[6],
      sourceLine: line,
      confidence: "high",
    });
  }

  m = line.match(EXCELLERIS_FLAG_LT) ?? collapsed.match(EXCELLERIS_FLAG_LT);
  if (m && isValidUnit(m[5])) {
    const bound = parseFloat(m[4]);
    return normalizeParsedRow({
      markerName: cleanMarkerName(m[1]),
      value: parseFloat(m[3]),
      rawFlag: m[2],
      referenceLow: 0,
      referenceHigh: bound,
      unit: m[5],
      sourceLine: line,
      confidence: "high",
    });
  }

  m = line.match(EXCELLERIS_LT_VALUE) ?? collapsed.match(EXCELLERIS_LT_VALUE);
  if (m && isValidUnit(m[4])) {
    const bound = parseFloat(m[3]);
    return normalizeParsedRow({
      markerName: cleanMarkerName(m[1]),
      value: parseFloat(m[2]),
      referenceLow: 0,
      referenceHigh: bound,
      unit: m[4],
      sourceLine: line,
      confidence: "high",
    });
  }

  m = line.match(LIFELABS_RANGE_ROW) ?? collapsed.match(LIFELABS_RANGE_ROW);
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

  m = line.match(EXCELLERIS_GT) ?? collapsed.match(EXCELLERIS_GT);
  if (m && isValidUnit(m[4])) {
    const bound = parseFloat(m[3]);
    return normalizeParsedRow({
      markerName: cleanMarkerName(m[1]),
      value: parseFloat(m[2]),
      referenceLow: bound,
      referenceHigh: bound * 3,
      unit: m[4],
      sourceLine: line,
      confidence: "high",
    });
  }

  m = line.match(EXCELLERIS_LT) ?? collapsed.match(EXCELLERIS_LT);
  if (m && isValidUnit(m[4])) {
    const bound = parseFloat(m[3]);
    return normalizeParsedRow({
      markerName: cleanMarkerName(m[1]),
      value: parseFloat(m[2]),
      referenceLow: 0,
      referenceHigh: bound,
      unit: m[4],
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

  m = line.match(EXCELLERIS_RANGE) ?? collapsed.match(EXCELLERIS_RANGE);
  if (m && isValidUnit(m[5])) {
    return normalizeParsedRow({
      markerName: cleanMarkerName(m[1]),
      value: parseFloat(m[2]),
      referenceLow: parseFloat(m[3]),
      referenceHigh: parseFloat(m[4]),
      unit: m[5],
      sourceLine: line,
      confidence: "high",
    });
  }

  m = line.match(EXCELLERIS_RATIO_LT) ?? collapsed.match(EXCELLERIS_RATIO_LT);
  if (m) {
    const bound = parseFloat(m[3]);
    return normalizeParsedRow({
      markerName: cleanMarkerName(m[1]),
      value: parseFloat(m[2]),
      referenceLow: 0,
      referenceHigh: bound,
      unit: "ratio",
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

  m = collapsed.match(VALUE_UNIT_ONLY);
  if (m && isValidUnit(m[3]) && looksLikeBiomarkerLine(m[1])) {
    const value = parseFloat(m[2]);
    return normalizeParsedRow({
      markerName: cleanMarkerName(m[1]),
      value,
      referenceLow: value,
      referenceHigh: value,
      unit: m[3],
      sourceLine: line,
      confidence: "medium",
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
  if (/^(bc|s\d+)$/i.test(u)) return false;
  return true;
}

/** Avoid parsing header/metadata lines that happen to contain numbers. */
function looksLikeBiomarkerLine(name: string): boolean {
  const n = name.trim();
  if (n.length < 3 || n.length > 80) return false;
  if (/^(patient|collected|reported|printed|ordered|lab no|page|test flag|with\b)/i.test(n)) return false;
  if (/=>/.test(n)) return false;
  if (/^\d/.test(n)) return false;
  return /[a-z]/i.test(n);
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

/** Merge orphaned flag/value rows onto the prior test row (column Y drift). */
function coalesceSplitResultLines(lines: string[]): string[] {
  const merged: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const next = lines[i + 1];

    if (next && isOrphanResultFragment(next) && isIncompleteTestRow(line)) {
      merged.push(`${line}  ${next}`.replace(/\s{2,}/g, "  ").trim());
      i += 1;
      continue;
    }

    merged.push(line);
  }

  return merged;
}

function isOrphanResultFragment(line: string): boolean {
  return /^(?:[ANHL*]\s+)?[\d.]+(?:\s+[ANHL*])?\s*$/.test(line.trim());
}

function isIncompleteTestRow(line: string): boolean {
  if (tryParseLine(line)) return false;
  if (SKIP_LINE.test(line) || SKIP_MARKER.test(line)) return false;
  if (/^(?:[ANHL*]\s+)?[\d.]+/.test(line)) return false;
  return /[a-z]/i.test(line);
}
