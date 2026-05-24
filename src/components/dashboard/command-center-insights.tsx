"use client";

import Link from "next/link";
import { Dna, Dumbbell, FlaskConical, HeartPulse, Leaf, Sparkles, Utensils } from "lucide-react";
import { InsightCard } from "@/components/cards/insight-card";
import { SectionHeader } from "@/components/dashboard/section-header";
import { Badge } from "@/components/ui/badge";
import { useCommandCenterAnalysis } from "@/hooks/use-command-center";
import type { GeneticBiomarkerFlag, RegimenCategory, RegimenRecommendation } from "@/types/command-center";

const regimenIcons: Record<RegimenCategory, typeof Utensils> = {
  diet: Utensils,
  exercise: HeartPulse,
  workout: Dumbbell,
  lifestyle: Leaf,
};

function GeneticFlagCard({ flag }: { flag: GeneticBiomarkerFlag }) {
  const statusLabel =
    flag.flag === "suboptimal"
      ? "Suboptimal"
      : flag.flag.charAt(0).toUpperCase() + flag.flag.slice(1);

  return (
    <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Dna className="h-4 w-4 shrink-0 text-violet-300" />
          <div>
            <p className="text-sm font-medium">{flag.biomarkerName}</p>
            <p className="text-xs text-muted-foreground">
              {flag.source === "lab" ? "Lab panel" : "Wearable"} · {flag.value}
              {flag.unit ? ` ${flag.unit}` : ""} · {statusLabel}
            </p>
          </div>
        </div>
        <Badge variant="outline" className="border-violet-400/30 text-[10px] text-violet-200">
          Genome-linked
        </Badge>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{flag.explanation}</p>
      <p className="mt-2 text-[10px] text-muted-foreground/70">
        Linked genes: {[...new Set(flag.linkedVariants.map((v) => v.gene))].join(", ")}
      </p>
    </div>
  );
}

function RegimenCard({ item }: { item: RegimenRecommendation }) {
  const Icon = regimenIcons[item.category];

  return (
    <div className="rounded-xl border border-white/[0.08] bg-background/40 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-500/10">
          <Icon className="h-4 w-4 text-teal-400" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-medium">{item.title}</h4>
            <Badge variant="outline" className="text-[9px] capitalize">
              {item.category}
            </Badge>
            {item.priority === "high" && (
              <Badge className="bg-amber-500/15 text-[9px] text-amber-200">Priority</Badge>
            )}
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{item.summary}</p>
          <p className="mt-2 text-[10px] text-muted-foreground/70">{item.rationale}</p>
        </div>
      </div>
    </div>
  );
}

export function CommandCenterInsights() {
  const { analysis, loading } = useCommandCenterAnalysis();

  if (loading && !analysis) {
    return (
      <section className="mt-8">
        <SectionHeader
          title="Integrated analysis"
          description="Cross-referencing genome, labs, and wearables"
        />
        <p className="text-sm text-muted-foreground">Building your regimen recommendations…</p>
      </section>
    );
  }

  if (!analysis) return null;

  const hasActionableData =
    analysis.hasGenome || analysis.hasLabs || analysis.hasWearables;

  if (!hasActionableData) {
    return (
      <section className="mt-8 rounded-2xl border border-dashed border-white/10 p-6">
        <SectionHeader
          title="Integrated analysis"
          description="Personalized diet, exercise, and workout guidance"
        />
        <p className="mt-2 text-sm text-muted-foreground">
          Import your{" "}
          <Link href="/genome" className="text-teal-400 hover:underline">
            genome report
          </Link>{" "}
          and{" "}
          <Link href="/upload" className="text-teal-400 hover:underline">
            lab panels
          </Link>{" "}
          to generate predisposition-aware regimens and genetic biomarker flags.
        </p>
      </section>
    );
  }

  const dietRecs = analysis.recommendations.filter((r) => r.category === "diet");
  const exerciseRecs = analysis.recommendations.filter(
    (r) => r.category === "exercise" || r.category === "workout"
  );
  const lifestyleRecs = analysis.recommendations.filter((r) => r.category === "lifestyle");

  return (
    <section className="mt-8 space-y-6">
      <div className="rounded-2xl border border-teal-500/15 bg-gradient-to-br from-teal-500/10 via-transparent to-violet-500/5 p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-500/15 ring-1 ring-teal-500/25">
            <Sparkles className="h-5 w-5 text-teal-300" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-teal-400/80">
              Integrated analysis
            </p>
            <h3 className="mt-1 text-lg font-medium">Predisposition-aware regimen plan</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{analysis.summary}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-muted-foreground">
              {analysis.hasGenome && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-1 ring-1 ring-white/10">
                  <Dna className="h-3 w-3" /> {analysis.variantCount} variants
                </span>
              )}
              {analysis.hasLabs && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-1 ring-1 ring-white/10">
                  <FlaskConical className="h-3 w-3" /> Lab overlap
                </span>
              )}
              {analysis.hasWearables && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-1 ring-1 ring-white/10">
                  <HeartPulse className="h-3 w-3" /> WHOOP
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {analysis.geneticFlags.length > 0 && (
        <div>
          <SectionHeader
            title="Genome-linked biomarker flags"
            description="Scores that may relate to reported genetic predispositions"
          />
          <div className="grid gap-3 lg:grid-cols-2">
            {analysis.geneticFlags.map((flag) => (
              <GeneticFlagCard key={flag.id} flag={flag} />
            ))}
          </div>
        </div>
      )}

      {analysis.hasGenome && analysis.geneticFlags.length === 0 && analysis.hasLabs && (
        <p className="rounded-xl border border-white/[0.08] bg-card/30 px-4 py-3 text-sm text-muted-foreground">
          No out-of-range lab markers directly match your genome-linked biomarker list on the
          latest panel. Recommendations below still reflect your top genetic risk domains.
        </p>
      )}

      {analysis.recommendations.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-3">
          {dietRecs.length > 0 && (
            <div>
              <SectionHeader title="Diet" description="Nutrition to counter predispositions" />
              <div className="space-y-3">
                {dietRecs.map((item) => (
                  <RegimenCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}
          {exerciseRecs.length > 0 && (
            <div>
              <SectionHeader title="Exercise & workouts" description="Training load and modality" />
              <div className="space-y-3">
                {exerciseRecs.map((item) => (
                  <RegimenCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}
          {lifestyleRecs.length > 0 && (
            <div>
              <SectionHeader
                title="Lifestyle"
                description="Recovery, sleep, and clinical alignment"
              />
              <div className="space-y-3">
                {lifestyleRecs.map((item) => (
                  <RegimenCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {analysis.topPredispositions.length > 0 && (
        <div>
          <SectionHeader
            title="Top genetic predispositions driving this plan"
            description="Highest-importance variants from your genome import"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            {analysis.topPredispositions.map((variant) => (
              <InsightCard
                key={`${variant.gene}-${variant.displayName}`}
                insight={{
                  id: variant.gene,
                  title: variant.displayName,
                  summary: `${variant.riskDomain.replace(/_/g, " ")} · ${variant.clinicalConfidence} confidence · importance ${variant.importanceScore}`,
                  evidenceLevel:
                    variant.clinicalConfidence === "high"
                      ? "A"
                      : variant.clinicalConfidence === "moderate"
                        ? "B"
                        : "C",
                }}
              />
            ))}
          </div>
        </div>
      )}

      {!analysis.hasGenome && (
        <p className="text-sm text-muted-foreground">
          <Link href="/genome" className="text-teal-400 hover:underline">
            Import genome JSON
          </Link>{" "}
          to unlock genetic biomarker flags and domain-specific regimens.
        </p>
      )}

      <p className="text-[10px] leading-relaxed text-muted-foreground/60">
        For informational use only—not medical advice. Regimens are derived from your imported
        genome, lab, and wearable data; confirm changes with a qualified clinician.
      </p>
    </section>
  );
}
