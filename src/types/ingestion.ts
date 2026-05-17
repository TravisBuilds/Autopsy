import type { BiomarkerCategory, BiomarkerFlag } from "@/types/health";

export type ParseConfidence = "high" | "medium" | "low";

export interface ParsedBiomarker {
  markerName: string;
  value: number;
  unit: string;
  referenceLow: number;
  referenceHigh: number;
  flag: BiomarkerFlag;
  rawFlag?: string;
  category: BiomarkerCategory;
  confidence: ParseConfidence;
  sourceLine?: string;
}

export interface LabParseResult {
  biomarkers: ParsedBiomarker[];
  sessionDate: string | null;
  labName: string | null;
  categories: BiomarkerCategory[];
  rawLineCount: number;
  parseErrors: string[];
}

export interface TestSession {
  id: string;
  date: string;
  labName?: string;
  sourceFileName?: string;
  biomarkerCount: number;
  createdAt: string;
}

export type UploadStep = "idle" | "extracting" | "parsing" | "review" | "saving" | "complete";
