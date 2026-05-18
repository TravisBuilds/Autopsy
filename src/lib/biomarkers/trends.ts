import type { BiomarkerReading } from "@/types/health";
import type { TestSession } from "@/types/ingestion";
import { toChartSeries } from "./chart-data";

export type TrendClassification =
  | "improving"
  | "worsening"
  | "stable"
  | "volatile"
  | "insufficient";

export interface TrendResult {
  classification: TrendClassification;
  label: string;
  description: string;
  percentChange?: number;
}

function lowerIsBetter(biomarker: BiomarkerReading): boolean {
  const mid = (biomarker.referenceLow + biomarker.referenceHigh) / 2;
  return biomarker.value > mid;
}

export function classifyTrend(
  biomarker: BiomarkerReading,
  sessions?: TestSession[]
): TrendResult {
  const series = toChartSeries(biomarker, sessions);
  const panelCount = series.length;

  if (panelCount < 2) {
    return {
      classification: "insufficient",
      label: panelCount === 1 ? "1 panel on record" : "No history",
      description:
        panelCount === 1
          ? "Annual labs are typical (1–2×/year). Your full value is saved — upload the next panel when you have it to see direction over time."
          : "Upload a lab report to start your archive.",
    };
  }

  const first = series[0].value;
  const last = series[series.length - 1].value;
  const pct = first !== 0 ? Math.round(((last - first) / first) * 100) : 0;
  const betterWhenLower = lowerIsBetter(biomarker);

  const directions = series.slice(1).map((p, i) => Math.sign(p.value - series[i].value));
  const signChanges = directions.slice(1).filter((d, i) => d !== 0 && d !== directions[i]).length;

  if (signChanges >= 2 && series.length >= 4) {
    return {
      classification: "volatile",
      label: "Variable",
      description: `Across ${panelCount} panels, values have moved up and down without a clear direction.`,
      percentChange: pct,
    };
  }

  if (Math.abs(pct) < 8) {
    return {
      classification: "stable",
      label: "Stable",
      description: `Relatively similar across ${panelCount} recorded panels.`,
      percentChange: pct,
    };
  }

  const improving = betterWhenLower ? last < first : last > first;

  if (improving) {
    return {
      classification: "improving",
      label: "Trending favorably",
      description: betterWhenLower
        ? `Down ${Math.abs(pct)}% from first to latest panel (${panelCount} total).`
        : `Up ${Math.abs(pct)}% from first to latest panel (${panelCount} total).`,
      percentChange: pct,
    };
  }

  return {
    classification: "worsening",
    label: "Direction shifted",
    description: betterWhenLower
      ? `Up ${Math.abs(pct)}% from first to latest panel (${panelCount} total). Lab reference is one data point — trends matter more over time.`
      : `Down ${Math.abs(pct)}% from first to latest panel (${panelCount} total).`,
    percentChange: pct,
  };
}
