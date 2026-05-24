"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import {
  estimatedRiskPercentile,
  riskZoneLabel,
} from "@/lib/genome/phenotype-definitions";
import { cn } from "@/lib/utils";

interface RiskDistributionChartProps {
  importanceScore: number;
  conditionLabel: string;
  className?: string;
}

interface DistributionBin {
  score: number;
  frequency: number;
  zone: "low" | "moderate" | "high";
}

const CHART_LEFT = 28;
const CHART_RIGHT = 8;

function buildDistribution(): DistributionBin[] {
  const mean = 50;
  const std = 14;
  const bins: DistributionBin[] = [];

  for (let start = 0; start < 100; start += 4) {
    const center = start + 2;
    const density = Math.exp(-0.5 * ((center - mean) / std) ** 2);
    const zone = center >= 70 ? "high" : center >= 40 ? "moderate" : "low";
    bins.push({
      score: center,
      frequency: Math.round(density * 95),
      zone,
    });
  }

  return bins;
}

function barFill(zone: DistributionBin["zone"]) {
  switch (zone) {
    case "high":
      return "#f87171";
    case "moderate":
      return "#facc15";
    default:
      return "#4ade80";
  }
}

function markerLeftPercent(score: number) {
  const clamped = Math.min(100, Math.max(0, score));
  return `calc(${CHART_LEFT}px + (100% - ${CHART_LEFT + CHART_RIGHT}px) * ${clamped / 100})`;
}

export function RiskDistributionChart({
  importanceScore,
  conditionLabel,
  className,
}: RiskDistributionChartProps) {
  const data = useMemo(() => buildDistribution(), []);
  const percentile = estimatedRiskPercentile(importanceScore);
  const clampedScore = Math.min(100, Math.max(0, importanceScore));

  return (
    <div className={cn("rounded-xl border border-white/[0.08] bg-background/30 p-4", className)}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Relative risk profile
          </p>
          <p className="mt-1 text-sm font-medium">{conditionLabel}</p>
        </div>
        <div className="text-right">
          <p className="font-mono text-lg tabular-nums text-sky-300">{percentile.toFixed(1)}%</p>
          <p className="text-[10px] text-muted-foreground">estimated percentile</p>
        </div>
      </div>

      <div className="relative mt-4 h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 28, right: CHART_RIGHT, left: 0, bottom: 4 }}
          >
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis
              type="number"
              dataKey="score"
              domain={[0, 100]}
              ticks={[0, 20, 40, 60, 80, 100]}
              tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 10 }}
              axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={CHART_LEFT}
            />
            <Bar dataKey="frequency" radius={[2, 2, 0, 0]} isAnimationActive={false}>
              {data.map((bin) => (
                <Cell key={bin.score} fill={barFill(bin.zone)} fillOpacity={0.85} />
              ))}
            </Bar>
            <ReferenceLine
              x={clampedScore}
              stroke="#38bdf8"
              strokeWidth={2}
              strokeDasharray="6 4"
              ifOverflow="extendDomain"
            />
          </BarChart>
        </ResponsiveContainer>

        <div
          className="pointer-events-none absolute top-0 z-10 flex -translate-x-1/2 flex-col items-center"
          style={{ left: markerLeftPercent(clampedScore) }}
          aria-hidden
        >
          <span className="rounded bg-sky-950/90 px-1.5 py-0.5 text-[10px] font-semibold text-sky-300 ring-1 ring-sky-400/40">
            You
          </span>
          <span className="mt-0.5 h-[calc(100%-1.25rem)] w-0 border-l-2 border-dashed border-sky-400" />
        </div>
      </div>

      <p className="mt-2 text-center text-xs text-sky-300/90">
        Your score: <span className="font-mono tabular-nums">{clampedScore}</span> on a 0–100 scale
        · {percentile.toFixed(1)}th percentile
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-green-400" />
          Lower
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-yellow-300" />
          Moderate
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-red-400" />
          Higher
        </span>
        <span className="text-muted-foreground/80">{riskZoneLabel(percentile)}</span>
      </div>
    </div>
  );
}
