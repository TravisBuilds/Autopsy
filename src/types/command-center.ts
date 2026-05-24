import type { BiomarkerFlag } from "@/types/health";

export type RegimenCategory = "diet" | "exercise" | "workout" | "lifestyle";

export interface LinkedVariantSummary {
  gene: string;
  displayName: string;
  riskDomain: string;
  importanceScore: number;
  clinicalConfidence: string;
}

export interface GeneticBiomarkerFlag {
  id: string;
  biomarkerName: string;
  source: "lab" | "wearable";
  value: number;
  unit: string;
  flag: BiomarkerFlag | "suboptimal";
  linkedVariants: LinkedVariantSummary[];
  explanation: string;
}

export interface RegimenRecommendation {
  id: string;
  category: RegimenCategory;
  title: string;
  summary: string;
  rationale: string;
  relatedGenes: string[];
  relatedDomains: string[];
  relatedBiomarkers: string[];
  priority: "high" | "medium" | "low";
}

export interface CommandCenterAnalysis {
  generatedAt: string;
  hasGenome: boolean;
  hasLabs: boolean;
  hasWearables: boolean;
  variantCount: number;
  summary: string;
  geneticFlags: GeneticBiomarkerFlag[];
  recommendations: RegimenRecommendation[];
  topPredispositions: LinkedVariantSummary[];
}
