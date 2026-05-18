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

export interface SessionReading {
  markerId: string;
  markerName: string;
  category: BiomarkerCategory;
  value: number;
  unit: string;
  referenceLow: number;
  referenceHigh: number;
  flag: BiomarkerFlag;
}

export interface TestSession {
  id: string;
  date: string;
  labName?: string;
  sourceFileName?: string;
  biomarkerCount: number;
  createdAt: string;
  readings: SessionReading[];
}

export interface PendingUpload {
  id: string;
  fileName: string;
  result: LabParseResult;
  sessionDate: string;
  error?: string;
}

export type UploadStep =
  | "idle"
  | "processing"
  | "batch-review"
  | "extracting"
  | "parsing"
  | "review"
  | "saving"
  | "complete";
