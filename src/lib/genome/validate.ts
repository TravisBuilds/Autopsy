import type { ClinicalConfidence, GenomeVariantInput } from "@/types/genome";

const CONFIDENCE_VALUES = new Set<ClinicalConfidence>(["high", "moderate", "low", "uncertain"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown, field: string, index: number): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Variant ${index}: ${field} must be a non-empty string`);
  }
  return value.trim();
}

function asStringArray(value: unknown, field: string, index: number): string[] {
  if (!Array.isArray(value)) {
    throw new Error(`Variant ${index}: ${field} must be an array`);
  }
  return value.map((item, itemIndex) => {
    if (typeof item !== "string") {
      throw new Error(`Variant ${index}: ${field}[${itemIndex}] must be a string`);
    }
    return item.trim();
  });
}

function asScore(value: unknown, index: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`Variant ${index}: importance_score must be a number`);
  }
  if (value < 0 || value > 100) {
    throw new Error(`Variant ${index}: importance_score must be between 0 and 100`);
  }
  return Math.round(value);
}

function asConfidence(value: unknown, index: number): ClinicalConfidence {
  if (typeof value !== "string" || !CONFIDENCE_VALUES.has(value as ClinicalConfidence)) {
    throw new Error(
      `Variant ${index}: clinical_confidence must be high, moderate, low, or uncertain`
    );
  }
  return value as ClinicalConfidence;
}

function parseVariant(raw: unknown, index: number): GenomeVariantInput {
  if (!isRecord(raw)) {
    throw new Error(`Variant ${index}: expected an object`);
  }

  return {
    gene: asString(raw.gene, "gene", index),
    risk_domain: asString(raw.risk_domain, "risk_domain", index),
    display_name: asString(raw.display_name, "display_name", index),
    variant_id: asString(raw.variant_id, "variant_id", index),
    genotype: asString(raw.genotype, "genotype", index),
    clinical_significance: asString(raw.clinical_significance, "clinical_significance", index),
    phenotype: asStringArray(raw.phenotype, "phenotype", index),
    display_summary: asString(raw.display_summary, "display_summary", index),
    importance_score: asScore(raw.importance_score, index),
    clinical_confidence: asConfidence(raw.clinical_confidence, index),
    linked_biomarkers: asStringArray(raw.linked_biomarkers, "linked_biomarkers", index),
    evidence_source: asStringArray(raw.evidence_source, "evidence_source", index),
    evidence_url: asString(raw.evidence_url, "evidence_url", index),
    hgvs: asString(raw.hgvs, "hgvs", index),
    last_interpreted_at: asString(raw.last_interpreted_at, "last_interpreted_at", index),
    knowledge_sources: asStringArray(raw.knowledge_sources, "knowledge_sources", index),
    interpretation_version: asString(raw.interpretation_version, "interpretation_version", index),
  };
}

export function parseGenomeImportPayload(raw: unknown): GenomeVariantInput[] {
  if (!Array.isArray(raw)) {
    throw new Error("Genome import payload must be a JSON array");
  }
  if (raw.length === 0) {
    throw new Error("Genome import payload must include at least one variant");
  }

  return raw.map((item, index) => parseVariant(item, index + 1));
}

export async function readGenomePayloadFromRequest(request: Request): Promise<{
  variants: GenomeVariantInput[];
  sourceFileName?: string;
}> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) {
      throw new Error("Missing genome JSON file");
    }

    const text = await file.text();
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error("Invalid JSON file");
    }

    return {
      variants: parseGenomeImportPayload(parsed),
      sourceFileName: file.name,
    };
  }

  let parsed: unknown;
  try {
    parsed = await request.json();
  } catch {
    throw new Error("Invalid JSON body");
  }

  return { variants: parseGenomeImportPayload(parsed) };
}
