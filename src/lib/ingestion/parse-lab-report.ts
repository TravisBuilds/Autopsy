import type { BiomarkerCategory } from "@/types/health";
import type { LabParseResult, ParsedBiomarker } from "@/types/ingestion";
import { dedupeBiomarkers, normalizeParsedRow } from "./normalize";

/** LifeLabs-style: LDL Cholesterol 4.31 A 1.50-3.40 mmol/L */
const LIFELABS_ROW =
  /^(.+?)\s+([\d.]+)\s+([AHL*<>]?\s*)?([\d.]+)\s*[-–—]\s*([\d.<>]+)\s+([^\s]+(?:\/[^\s]+)?)\s*$/i;

/** Parenthetical range: Glucose 5.4 (3.9-5.5) mmol/L */
const PAREN_RANGE =
  /^(.+?)\s+([\d.]+)\s+\(\s*([\d.]+)\s*[-–—]\s*([\d.<>]+)\s*\)\s*([^\s]+(?:\/[^\s]+)?)\s*$/i;

/** Tab or multi-space separated columns */
const COLUMN_ROW =
  /^(.+?)\t+([\d.]+)\s+([AHL*]?)\s+([\d.]+)\s*[-–]\s*([\d.<>]+)\s+(.+)$/i;

const DATE_PATTERNS = [
  /collection\s*(?:date|on)?[:\s]+(\d{4}[-/]\d{2}[-/]\d{2})/i,
  /collected[:\s]+([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i,
  /report\s*date[:\s]+(\d{4}[-/]\d{2}[-/]\d{2})/i,
  /(\d{4}[-/]\d{2}[-/]\d{2})/,
  /([A-Za-z]+\s+\d{1,2},?\s+\d{4})/,
];

const LAB_PATTERNS = [/lifelabs/i, /dynacare/i, /quest diagnostics/i, /labcorp/i];

export function parseLabReportText(text: string): LabParseResult {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const parseErrors: string[] = [];
  const raw: ParsedBiomarker[] = [];

  for (const line of lines) {
    if (line.length < 8 || line.length > 200) continue;
    if (/^(page|patient|name|address|phone|fax|lab|report)/i.test(line)) continue;

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
  const collapsed = line.replace(/\s{2,}/g, " ");

  let m = collapsed.match(LIFELABS_ROW);
  if (m) {
    return normalizeParsedRow({
      markerName: m[1],
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
      markerName: m[1],
      value: parseFloat(m[2]),
      referenceLow: parseFloat(m[3]),
      referenceHigh: parseUpperBound(m[4]),
      unit: m[5],
      sourceLine: line,
      confidence: "high",
    });
  }

  m = line.match(COLUMN_ROW);
  if (m) {
    return normalizeParsedRow({
      markerName: m[1],
      value: parseFloat(m[2]),
      rawFlag: m[3],
      referenceLow: parseFloat(m[4]),
      referenceHigh: parseUpperBound(m[5]),
      unit: m[6].trim(),
      sourceLine: line,
      confidence: "medium",
    });
  }

  return null;
}

function parseUpperBound(s: string): number {
  const cleaned = s.replace(/[<>]/g, "").trim();
  return parseFloat(cleaned) || 0;
}

function extractSessionDate(text: string): string | null {
  for (const pattern of DATE_PATTERNS) {
    const m = text.match(pattern);
    if (m?.[1]) {
      const d = new Date(m[1]);
      if (!Number.isNaN(d.getTime())) {
        return d.toISOString().slice(0, 10);
      }
    }
  }
  return null;
}

function extractLabName(text: string): string | null {
  for (const pattern of LAB_PATTERNS) {
    const m = text.match(pattern);
    if (m) return m[0];
  }
  return null;
}
