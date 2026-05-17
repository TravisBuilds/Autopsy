"use client";

import { HealthCard } from "@/components/cards/health-card";
import { Badge } from "@/components/ui/badge";
import type { Intervention } from "@/types/health";

interface InterventionCardProps {
  intervention: Intervention;
  delay?: number;
}

export function InterventionCard({ intervention, delay = 0 }: InterventionCardProps) {
  return (
    <HealthCard delay={delay}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-medium">{intervention.name}</h3>
          <p className="mt-0.5 text-xs capitalize text-muted-foreground">{intervention.type}</p>
        </div>
        {intervention.active && (
          <Badge variant="outline" className="border-emerald-400/30 bg-emerald-400/10 text-[10px] text-emerald-400">
            Active
          </Badge>
        )}
      </div>
      {(intervention.dosage || intervention.frequency) && (
        <p className="mt-3 font-mono text-xs text-muted-foreground">
          {[intervention.dosage, intervention.frequency].filter(Boolean).join(" · ")}
        </p>
      )}
      <p className="mt-2 text-[10px] text-muted-foreground/60">Since {intervention.startDate}</p>
    </HealthCard>
  );
}
