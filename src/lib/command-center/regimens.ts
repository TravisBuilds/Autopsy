import type { RegimenRecommendation } from "@/types/command-center";
import type { GenomeVariant } from "@/types/genome";

const DOMAIN_REGIMENS: Record<
  string,
  Omit<RegimenRecommendation, "id" | "relatedGenes" | "relatedDomains" | "relatedBiomarkers">[]
> = {
  cardiovascular: [
    {
      category: "diet",
      title: "Heart-forward eating pattern",
      summary:
        "Emphasize soluble fiber (oats, legumes), fatty fish 2–3×/week, nuts, olive oil, and limit refined carbs and trans fats.",
      rationale:
        "Supports LDL and ApoB management when genetic cholesterol variants are present.",
      priority: "high",
    },
    {
      category: "exercise",
      title: "Aerobic base + daily movement",
      summary:
        "Target 150+ minutes/week moderate cardio (brisk walking, cycling) plus brief walks after meals.",
      rationale:
        "Improves lipid clearance and endothelial health beyond diet alone.",
      priority: "high",
    },
    {
      category: "workout",
      title: "Zone 2 with weekly intervals",
      summary:
        "2–3 Zone 2 sessions (60–70% max HR, 30–45 min) and 1 short interval session if recovery allows.",
      rationale:
        "Builds mitochondrial capacity linked to better lipid profiles in predisposed individuals.",
      priority: "medium",
    },
  ],
  metabolic: [
    {
      category: "diet",
      title: "Glycemic stability plan",
      summary:
        "Pair carbs with protein/fat, prioritize low-GI foods, limit sugary drinks, and keep consistent meal timing.",
      rationale:
        "Blunts glucose spikes when diabetes- or insulin-related variants are reported.",
      priority: "high",
    },
    {
      category: "exercise",
      title: "Post-meal movement",
      summary:
        "10–15 minute walk after largest meals; add 2 resistance sessions/week for insulin sensitivity.",
      rationale:
        "Post-prandial activity is one of the fastest levers for glucose control.",
      priority: "high",
    },
    {
      category: "workout",
      title: "Strength-first metabolic block",
      summary:
        "Full-body resistance 2–3×/week (compound lifts or bands) with progressive overload.",
      rationale:
        "Muscle is the primary sink for glucose; strength training counters metabolic predisposition.",
      priority: "medium",
    },
  ],
  liver: [
    {
      category: "diet",
      title: "Liver-supportive nutrition",
      summary:
        "Limit alcohol, reduce ultra-processed foods, include cruciferous vegetables and adequate hydration.",
      rationale:
        "Reduces hepatic load when bilirubin or UGT-related variants affect processing.",
      priority: "high",
    },
    {
      category: "lifestyle",
      title: "Medication & toxin review",
      summary:
        "Track alcohol, acetaminophen, and supplements; discuss hepatotoxic drugs with your clinician if on UGT/CYP variants.",
      rationale:
        "Pharmacogenomic and liver variants can alter drug and bilirubin handling.",
      priority: "medium",
    },
  ],
  inflammation: [
    {
      category: "diet",
      title: "Anti-inflammatory plate",
      summary:
        "Mediterranean-style pattern: leafy greens, berries, omega-3 sources, spices (turmeric, ginger), minimal processed meat.",
      rationale:
        "May lower CRP and immune activation when inflammatory or neutrophil-linked variants exist.",
      priority: "high",
    },
    {
      category: "exercise",
      title: "Recoverable training load",
      summary:
        "Moderate activity most days; avoid chronic overreaching when CRP or WBC trends are elevated.",
      rationale:
        "Excessive strain without recovery can worsen inflammatory markers.",
      priority: "medium",
    },
  ],
  neurology: [
    {
      category: "lifestyle",
      title: "Sleep & stress architecture",
      summary:
        "Fixed sleep/wake window, morning light, wind-down routine, and limit late caffeine/alcohol.",
      rationale:
        "Serotonin and neuro-related variants often respond to circadian stability.",
      priority: "high",
    },
    {
      category: "exercise",
      title: "Low-intensity nervous-system training",
      summary:
        "Walking, yoga, or breathwork 4–5×/week; keep high-intensity days spaced when HRV is low.",
      rationale:
        "Supports autonomic balance tied to HRV and recovery metrics.",
      priority: "medium",
    },
  ],
  fitness: [
    {
      category: "workout",
      title: "Hybrid endurance–power split",
      summary:
        "Blend Zone 2 endurance with 1–2 sprint or power sessions if ACTN3/performance variants suggest mixed fiber profile.",
      rationale:
        "Aligns training with reported muscle-fiber and performance associations.",
      priority: "medium",
    },
  ],
  pharmacogenomics: [
    {
      category: "lifestyle",
      title: "Medication awareness",
      summary:
        "Maintain a list of drug reactions and share genome pharmacogenomic flags with your prescriber before new medications.",
      rationale:
        "BCHE, UGT, and CYP-linked variants can alter anesthesia and chemotherapy response.",
      priority: "high",
    },
  ],
  oncology: [
    {
      category: "lifestyle",
      title: "Risk-reduction baseline",
      summary:
        "Avoid tobacco, limit alcohol, maintain healthy weight, and follow age-appropriate screening with your clinician.",
      rationale:
        "Genetic cancer-predisposition reports warrant prevention focus—not self-treatment.",
      priority: "medium",
    },
  ],
  genetic_condition: [
    {
      category: "lifestyle",
      title: "Clinician-guided monitoring",
      summary:
        "Use genome findings to inform specialist follow-up and screening—not to self-diagnose.",
      rationale:
        "Monogenic or syndrome-associated variants need professional interpretation.",
      priority: "medium",
    },
  ],
};

export function buildDomainRegimens(
  domains: string[],
  genes: string[],
  biomarkers: string[]
): RegimenRecommendation[] {
  const seen = new Set<string>();
  const results: RegimenRecommendation[] = [];

  for (const domain of domains) {
    const templates = DOMAIN_REGIMENS[domain] ?? DOMAIN_REGIMENS.genetic_condition;
    for (const template of templates) {
      const key = `${template.category}:${template.title}`;
      if (seen.has(key)) continue;
      seen.add(key);
      results.push({
        ...template,
        id: key,
        relatedGenes: genes,
        relatedDomains: [domain],
        relatedBiomarkers: biomarkers,
      });
    }
  }

  return results.sort((a, b) => {
    const weight = { high: 0, medium: 1, low: 2 };
    return weight[a.priority] - weight[b.priority];
  });
}

export function dominantDomainsFromVariants(variants: GenomeVariant[]): string[] {
  const counts = new Map<string, number>();
  for (const variant of variants) {
    counts.set(variant.riskDomain, (counts.get(variant.riskDomain) ?? 0) + variant.importanceScore);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([domain]) => domain)
    .slice(0, 4);
}
