import type { GenomeImport, GenomeVariant, GenomeVariantInput } from "@/types/genome";
import type { Database } from "@/lib/supabase/database.types";

type GenomeImportRow = Database["public"]["Tables"]["genome_imports"]["Row"];
type GenomeVariantRow = Database["public"]["Tables"]["genome_variants"]["Row"];

export function rowToGenomeImport(row: GenomeImportRow): GenomeImport {
  return {
    id: row.id,
    sourceFileName: row.source_file_name ?? undefined,
    variantCount: row.variant_count,
    interpretationVersion: row.interpretation_version,
    lastInterpretedAt: row.last_interpreted_at ?? undefined,
    createdAt: row.created_at,
  };
}

export function rowToGenomeVariant(row: GenomeVariantRow): GenomeVariant {
  return {
    id: row.id,
    gene: row.gene,
    riskDomain: row.risk_domain,
    displayName: row.display_name,
    variantId: row.variant_id,
    genotype: row.genotype,
    clinicalSignificance: row.clinical_significance,
    phenotype: row.phenotype,
    displaySummary: row.display_summary,
    importanceScore: row.importance_score,
    clinicalConfidence: row.clinical_confidence,
    linkedBiomarkers: row.linked_biomarkers,
    evidenceSource: row.evidence_source,
    evidenceUrl: row.evidence_url ?? undefined,
    hgvs: row.hgvs ?? undefined,
    lastInterpretedAt: row.last_interpreted_at ?? undefined,
    knowledgeSources: row.knowledge_sources,
    interpretationVersion: row.interpretation_version,
  };
}

export function variantInputToRow(
  userId: string,
  importId: string,
  input: GenomeVariantInput
): Database["public"]["Tables"]["genome_variants"]["Insert"] {
  return {
    user_id: userId,
    import_id: importId,
    gene: input.gene,
    risk_domain: input.risk_domain,
    display_name: input.display_name,
    variant_id: input.variant_id,
    genotype: input.genotype,
    clinical_significance: input.clinical_significance,
    phenotype: input.phenotype,
    display_summary: input.display_summary,
    importance_score: input.importance_score,
    clinical_confidence: input.clinical_confidence,
    linked_biomarkers: input.linked_biomarkers,
    evidence_source: input.evidence_source,
    evidence_url: input.evidence_url,
    hgvs: input.hgvs,
    last_interpreted_at: input.last_interpreted_at,
    knowledge_sources: input.knowledge_sources,
    interpretation_version: input.interpretation_version,
  };
}
