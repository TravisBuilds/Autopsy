import {
  variantsLinkingToLabMarker,
  variantsLinkingToWearableMetric,
  wearableMetricsFromSnapshot,
} from "@/lib/command-center/marker-links";
import { buildDomainRegimens, dominantDomainsFromVariants } from "@/lib/command-center/regimens";
import { flagLabel } from "@/lib/biomarkers/reference-labels";
import type {
  CommandCenterAnalysis,
  GeneticBiomarkerFlag,
  LinkedVariantSummary,
  RegimenRecommendation,
} from "@/types/command-center";
import type { BiomarkerReading, Intervention, WearableSnapshot } from "@/types/health";
import type { GenomeVariant } from "@/types/genome";

export interface AnalyzeCommandCenterInput {
  variants: GenomeVariant[];
  biomarkers: BiomarkerReading[];
  wearable: WearableSnapshot | null;
  interventions: Intervention[];
}

function toVariantSummary(variant: GenomeVariant): LinkedVariantSummary {
  return {
    gene: variant.gene,
    displayName: variant.displayName,
    riskDomain: variant.riskDomain,
    importanceScore: variant.importanceScore,
    clinicalConfidence: variant.clinicalConfidence,
  };
}

function buildGeneticExplanation(
  name: string,
  source: "lab" | "wearable",
  flagText: string,
  variants: GenomeVariant[]
): string {
  const genes = [...new Set(variants.map((v) => v.gene))].slice(0, 3).join(", ");
  const domains = [...new Set(variants.map((v) => v.riskDomain.replace(/_/g, " ")))].join(", ");
  const sourceLabel = source === "lab" ? "latest lab panel" : "recent wearable data";

  return `Your ${name} reading is ${flagText} on ${sourceLabel}. Variants in ${genes} from your genome report are linked to ${domains} pathways and may contribute to this pattern. Discuss with your clinician before changing medications or treatment.`;
}

function flagLabGeneticLinks(
  variants: GenomeVariant[],
  biomarkers: BiomarkerReading[]
): GeneticBiomarkerFlag[] {
  const flags: GeneticBiomarkerFlag[] = [];

  for (const reading of biomarkers) {
    if (reading.flag === "normal") continue;

    const linked = variantsLinkingToLabMarker(variants, reading);
    if (linked.length === 0) continue;

    flags.push({
      id: `lab-${reading.id}`,
      biomarkerName: reading.markerName,
      source: "lab",
      value: reading.value,
      unit: reading.unit,
      flag: reading.flag,
      linkedVariants: linked.map(toVariantSummary),
      explanation: buildGeneticExplanation(
        reading.markerName,
        "lab",
        flagLabel(reading.flag).toLowerCase(),
        linked
      ),
    });
  }

  return flags.sort(
    (a, b) =>
      Math.max(...b.linkedVariants.map((v) => v.importanceScore)) -
      Math.max(...a.linkedVariants.map((v) => v.importanceScore))
  );
}

function flagWearableGeneticLinks(
  variants: GenomeVariant[],
  wearable: WearableSnapshot | null
): GeneticBiomarkerFlag[] {
  if (!wearable) return [];

  const flags: GeneticBiomarkerFlag[] = [];

  for (const metric of wearableMetricsFromSnapshot(wearable)) {
    if (metric.flag === "normal") continue;

    const linked = variantsLinkingToWearableMetric(variants, metric);
    if (linked.length === 0) continue;

    flags.push({
      id: metric.id,
      biomarkerName: metric.biomarkerName,
      source: "wearable",
      value: metric.value,
      unit: metric.unit,
      flag: "suboptimal",
      linkedVariants: linked.map(toVariantSummary),
      explanation: buildGeneticExplanation(
        metric.biomarkerName,
        "wearable",
        "suboptimal",
        linked
      ),
    });
  }

  return flags;
}

function adjustForActiveInterventions(
  recommendations: RegimenRecommendation[],
  interventions: Intervention[]
): RegimenRecommendation[] {
  const activeTypes = new Set(
    interventions.filter((i) => i.active).map((i) => i.type)
  );

  return recommendations.map((rec) => {
    const matchesIntervention =
      (rec.category === "diet" && activeTypes.has("diet")) ||
      (rec.category === "lifestyle" && activeTypes.has("lifestyle")) ||
      ((rec.category === "exercise" || rec.category === "workout") &&
        (activeTypes.has("exercise") || activeTypes.has("lifestyle")));

    if (matchesIntervention) {
      return {
        ...rec,
        summary: `${rec.summary} You already track an active ${rec.category} intervention—use this as a refinement guide.`,
        priority: rec.priority === "high" ? "medium" : rec.priority,
      };
    }
    return rec;
  });
}

function buildSummary(
  input: AnalyzeCommandCenterInput,
  geneticFlags: GeneticBiomarkerFlag[],
  domains: string[]
): string {
  const parts: string[] = [];

  if (input.variants.length > 0) {
    parts.push(
      `${input.variants.length} interpreted variants across ${domains.length || 1} risk domains`
    );
  }

  if (geneticFlags.length > 0) {
    parts.push(
      `${geneticFlags.length} biomarker or wearable signal${geneticFlags.length === 1 ? "" : "s"} may overlap with reported genetic predispositions`
    );
  } else if (input.variants.length > 0 && input.biomarkers.length > 0) {
    parts.push(
      "No direct lab-to-genome overlaps detected on your latest panel—regimens focus on top genetic risk domains"
    );
  }

  if (input.wearable) {
    parts.push("WHOOP recovery metrics included where variants link to sleep, HRV, or strain");
  }

  if (parts.length === 0) {
    return "Import genome data and lab panels to generate personalized regimen recommendations.";
  }

  return parts.join(". ") + ".";
}

export function analyzeCommandCenter(input: AnalyzeCommandCenterInput): CommandCenterAnalysis {
  const { variants, biomarkers, wearable, interventions } = input;
  const hasGenome = variants.length > 0;
  const hasLabs = biomarkers.some((b) => b.flag !== "normal");
  const hasWearables = Boolean(wearable);

  const geneticFlags = [
    ...flagLabGeneticLinks(variants, biomarkers),
    ...flagWearableGeneticLinks(variants, wearable),
  ];

  const flaggedDomains = [
    ...new Set(geneticFlags.flatMap((f) => f.linkedVariants.map((v) => v.riskDomain))),
  ];
  const dominantDomains =
    flaggedDomains.length > 0
      ? flaggedDomains
      : dominantDomainsFromVariants(
          [...variants].sort((a, b) => b.importanceScore - a.importanceScore).slice(0, 8)
        );

  const relatedGenes = [
    ...new Set(
      variants
        .filter((v) => dominantDomains.includes(v.riskDomain))
        .map((v) => v.gene)
    ),
  ].slice(0, 6);

  const relatedBiomarkers = [
    ...new Set(geneticFlags.map((f) => f.biomarkerName)),
  ];

  let recommendations = hasGenome
    ? buildDomainRegimens(dominantDomains, relatedGenes, relatedBiomarkers)
    : [];

  recommendations = adjustForActiveInterventions(recommendations, interventions);

  const topPredispositions = [...variants]
    .sort((a, b) => b.importanceScore - a.importanceScore)
    .slice(0, 5)
    .map(toVariantSummary);

  return {
    generatedAt: new Date().toISOString(),
    hasGenome,
    hasLabs,
    hasWearables,
    variantCount: variants.length,
    summary: buildSummary(input, geneticFlags, dominantDomains),
    geneticFlags,
    recommendations,
    topPredispositions,
  };
}

export function geneticFlagForBiomarker(
  analysis: CommandCenterAnalysis | null,
  biomarker: BiomarkerReading
): GeneticBiomarkerFlag | undefined {
  if (!analysis) return undefined;
  return analysis.geneticFlags.find(
    (f) => f.source === "lab" && f.biomarkerName === biomarker.markerName
  );
}
