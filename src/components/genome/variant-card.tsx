"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ExternalLink } from "lucide-react";
import { RiskDistributionChart } from "@/components/genome/risk-distribution-chart";
import {
  describePhenotypes,
  estimatedRiskPercentile,
  primaryPhenotypeLabel,
  riskDomainLabel,
} from "@/lib/genome/phenotype-definitions";
import { cn } from "@/lib/utils";
import type { GenomeVariant } from "@/types/genome";

function confidenceClass(confidence: GenomeVariant["clinicalConfidence"]) {
  switch (confidence) {
    case "high":
      return "text-red-300 bg-red-500/10 ring-red-500/20";
    case "moderate":
      return "text-amber-200 bg-amber-500/10 ring-amber-500/20";
    case "low":
      return "text-sky-200 bg-sky-500/10 ring-sky-500/20";
    default:
      return "text-muted-foreground bg-white/5 ring-white/10";
  }
}

interface VariantCardProps {
  variant: GenomeVariant;
}

export function VariantCard({ variant }: VariantCardProps) {
  const [expanded, setExpanded] = useState(false);
  const phenotypes = describePhenotypes(variant.phenotype);
  const chartLabel = primaryPhenotypeLabel(variant.phenotype);
  const percentile = estimatedRiskPercentile(variant.importanceScore);

  return (
    <article className="rounded-2xl border border-white/[0.08] bg-background/40">
      <button
        type="button"
        onClick={() => setExpanded((open) => !open)}
        className="flex w-full items-start justify-between gap-4 p-5 text-left transition-colors hover:bg-white/[0.02]"
        aria-expanded={expanded}
      >
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-[0.18em] text-teal-400/80">
            {variant.gene} · {riskDomainLabel(variant.riskDomain)}
          </p>
          <h4 className="mt-1 text-lg font-medium leading-snug">{variant.displayName}</h4>
          <p className="mt-2 text-sm text-muted-foreground">
            {variant.genotype} · {variant.clinicalSignificance}
          </p>
          {!expanded && (
            <p className="mt-2 text-xs text-muted-foreground/80">
              Tap to view definitions and risk chart · {percentile.toFixed(1)}th percentile
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-[10px] uppercase tracking-wide ring-1",
              confidenceClass(variant.clinicalConfidence)
            )}
          >
            {variant.clinicalConfidence}
          </span>
          <span className="rounded-full bg-teal-500/10 px-2.5 py-1 text-sm font-medium tabular-nums text-teal-300 ring-1 ring-teal-500/20">
            {variant.importanceScore}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              expanded && "rotate-180"
            )}
          />
        </div>
      </button>

      {expanded && (
        <div className="border-t border-white/[0.06] px-5 pb-5">
          {phenotypes.length > 0 && (
            <div className="space-y-3 pt-5">
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                What this means
              </p>
              {phenotypes.map((item) => (
                <div key={item.label} className="rounded-xl bg-white/[0.03] px-4 py-3">
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {item.definition}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="mt-5">
            <RiskDistributionChart
              importanceScore={variant.importanceScore}
              conditionLabel={chartLabel}
            />
          </div>

          <div className="mt-5 grid gap-3 border-t border-white/[0.06] pt-5 text-sm text-muted-foreground sm:grid-cols-2">
            <p>
              <span className="text-foreground/80">Variant:</span> {variant.variantId}
            </p>
            {variant.hgvs && (
              <p className="truncate sm:col-span-2" title={variant.hgvs}>
                <span className="text-foreground/80">HGVS:</span> {variant.hgvs}
              </p>
            )}
            {variant.linkedBiomarkers.length > 0 && (
              <p className="sm:col-span-2">
                <span className="text-foreground/80">Linked biomarkers:</span>{" "}
                {variant.linkedBiomarkers.join(", ")}
              </p>
            )}
          </div>

          {variant.evidenceUrl && (
            <Link
              href={variant.evidenceUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-xs text-teal-400 hover:underline"
            >
              View ClinVar evidence
              <ExternalLink className="h-3 w-3" />
            </Link>
          )}
        </div>
      )}
    </article>
  );
}
