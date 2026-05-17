"use client";

import { HealthCard } from "@/components/cards/health-card";
import type { WearableSnapshot } from "@/types/health";

interface WearableCardProps {
  data: WearableSnapshot;
  delay?: number;
}

const metrics = (d: WearableSnapshot) => [
  { label: "Recovery", value: `${d.recovery}%` },
  { label: "HRV", value: `${d.hrv} ms` },
  { label: "Resting HR", value: `${d.restingHr} bpm` },
  { label: "Sleep", value: `${d.sleepScore}%` },
  { label: "Strain", value: d.strain.toFixed(1) },
];

export function WearableCard({ data, delay = 0 }: WearableCardProps) {
  return (
    <HealthCard delay={delay}>
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          {data.source}
        </p>
        <p className="font-mono text-[10px] text-muted-foreground/60">{data.date}</p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {metrics(data).map((m) => (
          <div key={m.label}>
            <p className="text-[10px] text-muted-foreground">{m.label}</p>
            <p className="mt-0.5 font-mono text-lg font-light tabular-nums">{m.value}</p>
          </div>
        ))}
      </div>
    </HealthCard>
  );
}
