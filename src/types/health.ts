export type BiomarkerFlag = "low" | "normal" | "high" | "critical";

export type BiomarkerCategory =
  | "cardiovascular"
  | "metabolic"
  | "liver"
  | "hematology"
  | "kidney"
  | "inflammation"
  | "hormones"
  | "vitamins";

export interface BiomarkerReading {
  id: string;
  markerName: string;
  category: BiomarkerCategory;
  value: number;
  unit: string;
  referenceLow: number;
  referenceHigh: number;
  flag: BiomarkerFlag;
  date: string;
  history?: { date: string; value: number }[];
  changePercent?: number;
  insight?: string;
}

export interface HealthAlert {
  id: string;
  title: string;
  description: string;
  severity: "info" | "warning" | "critical";
  category: BiomarkerCategory | "wearable" | "imaging";
  timestamp: string;
}

export interface Intervention {
  id: string;
  name: string;
  type: "supplement" | "medication" | "diet" | "exercise" | "lifestyle";
  dosage?: string;
  frequency?: string;
  startDate: string;
  endDate?: string;
  active: boolean;
}

export interface WearableSnapshot {
  source: string;
  recovery: number;
  hrv: number;
  restingHr: number;
  sleepScore: number;
  strain: number;
  date: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  label: string;
  type: "biomarker" | "intervention" | "imaging" | "wearable" | "lifestyle";
  direction?: "up" | "down" | "neutral";
  markers?: string[];
}

export interface AIInsight {
  id: string;
  title: string;
  summary: string;
  evidenceLevel?: "A" | "B" | "C";
  relatedMarkers?: string[];
}
