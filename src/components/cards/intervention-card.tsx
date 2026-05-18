"use client";

import { HealthCard } from "@/components/cards/health-card";
import { Badge } from "@/components/ui/badge";
import { formatTimelineDate, normalizeSessionDate } from "@/lib/biomarkers/dates";
import {
  formatInterventionSince,
  formatInterventionSummary,
  interventionTypeLabel,
  isInterventionActive,
} from "@/lib/interventions/format";
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
          <p className="mt-0.5 text-xs text-muted-foreground">
            {interventionTypeLabel(intervention.type)}
          </p>
        </div>
        {isInterventionActive(intervention) && (
          <Badge variant="outline" className="border-emerald-400/30 bg-emerald-400/10 text-[10px] text-emerald-400">
            Active
          </Badge>
        )}
      </div>
      <p className="mt-3 font-mono text-xs text-muted-foreground">
        {formatInterventionSummary(intervention)}
      </p>
      {intervention.notes && (
        <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{intervention.notes}</p>
      )}
      <p className="mt-2 text-[10px] text-muted-foreground/60">
        Started {formatInterventionSince(intervention)}
        {intervention.endDate
          ? ` · ended ${formatTimelineDate(normalizeSessionDate(intervention.endDate))}`
          : ""}
      </p>
    </HealthCard>
  );
}
