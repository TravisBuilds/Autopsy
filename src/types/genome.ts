export type ClinicalConfidence = "high" | "moderate" | "low" | "uncertain";

export interface GenomeVariantInput {
  gene: string;
  risk_domain: string;
  display_name: string;
  variant_id: string;
  genotype: string;
  clinical_significance: string;
  phenotype: string[];
  display_summary: string;
  importance_score: number;
  clinical_confidence: ClinicalConfidence;
  linked_biomarkers: string[];
  evidence_source: string[];
  evidence_url: string;
  hgvs: string;
  last_interpreted_at: string;
  knowledge_sources: string[];
  interpretation_version: string;
}

export interface GenomeImport {
  id: string;
  sourceFileName?: string;
  variantCount: number;
  interpretationVersion: string;
  lastInterpretedAt?: string;
  createdAt: string;
}

export interface GenomeVariant {
  id: string;
  gene: string;
  riskDomain: string;
  displayName: string;
  variantId: string;
  genotype: string;
  clinicalSignificance: string;
  phenotype: string[];
  displaySummary: string;
  importanceScore: number;
  clinicalConfidence: ClinicalConfidence;
  linkedBiomarkers: string[];
  evidenceSource: string[];
  evidenceUrl?: string;
  hgvs?: string;
  lastInterpretedAt?: string;
  knowledgeSources: string[];
  interpretationVersion: string;
}

export interface GenomeProfile {
  import: GenomeImport | null;
  variants: GenomeVariant[];
}
