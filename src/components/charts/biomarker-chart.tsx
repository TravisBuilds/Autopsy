"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { chartYDomain, toChartSeries, type ChartPoint } from "@/lib/biomarkers/chart-data";
import { referenceStatusLabel } from "@/lib/biomarkers/reference-labels";
import { useHealthStore } from "@/stores/health-store";
import type { BiomarkerReading } from "@/types/health";
import { cn } from "@/lib/utils";

interface BiomarkerChartProps {
  biomarker: BiomarkerReading;
  height?: number;
  className?: string;
}

function ChartTooltip({
  active,
  payload,
  unit,
  referenceLow,
  referenceHigh,
}: {
  active?: boolean;
  payload?: { payload: ChartPoint }[];
  unit: string;
  referenceLow: number;
  referenceHigh: number;
}) {
  if (!active || !payload?.[0]) return null;
  const point = payload[0].payload;

  return (
    <div className="rounded-lg border border-white/10 bg-popover/95 px-3 py-2 shadow-xl backdrop-blur-md">
      <p className="text-[10px] text-muted-foreground">{point.label}</p>
      <p className="font-mono text-sm tabular-nums">
        {point.value} <span className="text-muted-foreground">{unit}</span>
      </p>
      <p className="mt-0.5 text-[10px] text-muted-foreground">
        {referenceStatusLabel(point.inRange, point.value, referenceLow, referenceHigh)}
      </p>
      <p className="text-[10px] text-muted-foreground/70">
        Lab ref. {referenceLow}–{referenceHigh} {unit}
      </p>
    </div>
  );
}

export function BiomarkerChart({ biomarker, height = 220, className }: BiomarkerChartProps) {
  const sessions = useHealthStore((s) => s.testSessions);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const series = useMemo(
    () => toChartSeries(biomarker, sessions),
    [biomarker, sessions]
  );
  const [yMin, yMax] = useMemo(
    () => chartYDomain(series, biomarker.referenceLow, biomarker.referenceHigh),
    [series, biomarker.referenceLow, biomarker.referenceHigh]
  );

  const stroke = "#2dd4bf";

  if (series.length < 1) {
    return (
      <div
        className={cn("flex items-center justify-center text-xs text-muted-foreground", className)}
        style={{ height }}
      >
        No panels yet for this marker
      </div>
    );
  }

  if (!mounted) {
    return <div className={className} style={{ height, minHeight: height }} />;
  }

  return (
    <div className={cn("w-full min-w-0", className)} style={{ height, minHeight: height }}>
      <ResponsiveContainer width="100%" height={height} minWidth={0}>
        <ComposedChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="rangeFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2dd4bf" stopOpacity={0.12} />
              <stop offset="100%" stopColor="#2dd4bf" stopOpacity={0.04} />
            </linearGradient>
          </defs>

          <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />

          <ReferenceArea
            y1={biomarker.referenceLow}
            y2={biomarker.referenceHigh}
            fill="url(#rangeFill)"
            strokeOpacity={0}
          />

          <XAxis
            dataKey="label"
            tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            dy={6}
          />
          <YAxis
            domain={[yMin, yMax]}
            tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={40}
            tickFormatter={(v) => (Number.isInteger(v) ? v : v.toFixed(1))}
          />

          <Tooltip
            content={
              <ChartTooltip
                unit={biomarker.unit}
                referenceLow={biomarker.referenceLow}
                referenceHigh={biomarker.referenceHigh}
              />
            }
            cursor={{ stroke: "rgba(255,255,255,0.1)", strokeWidth: 1 }}
          />

          <Line
            type="monotone"
            dataKey="value"
            stroke={stroke}
            strokeWidth={2}
            dot={({ cx, cy, payload }) => {
              const p = payload as ChartPoint;
              if (cx == null || cy == null) return null;
              return (
                <circle
                  key={p.date}
                  cx={cx}
                  cy={cy}
                  r={4}
                  fill={p.inRange ? "#0d9488" : "#fbbf24"}
                  stroke={stroke}
                  strokeWidth={2}
                />
              );
            }}
            activeDot={{ r: 6, fill: stroke, stroke: "#fff", strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>

      <p className="mt-2 text-center text-[10px] text-muted-foreground">
        Shaded band = lab reference range ({biomarker.referenceLow}–{biomarker.referenceHigh}{" "}
        {biomarker.unit}) · {series.length} panel{series.length !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
