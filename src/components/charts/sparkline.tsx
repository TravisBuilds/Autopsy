"use client";

import { useEffect, useState } from "react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

interface SparklineProps {
  data: { value: number }[];
  className?: string;
  color?: string;
  height?: number;
}

export function Sparkline({
  data,
  className,
  color = "var(--accent-glow)",
  height = 48,
}: SparklineProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!data.length) return null;

  const gradientId = `spark-${data.length}-${data[0]?.value}`;

  return (
    <div
      className={cn("w-full min-w-0", className)}
      style={{ height, minHeight: height }}
    >
      {mounted ? (
        <ResponsiveContainer width="100%" height={height} minWidth={0}>
          <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={1.5}
              fill={`url(#${gradientId})`}
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : null}
    </div>
  );
}
