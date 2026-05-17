"use client";

import { Sparkles } from "lucide-react";
import { HealthCard } from "@/components/cards/health-card";
import { Badge } from "@/components/ui/badge";
import type { AIInsight } from "@/types/health";

interface InsightCardProps {
  insight: AIInsight;
  delay?: number;
}

export function InsightCard({ insight, delay = 0 }: InsightCardProps) {
  return (
    <HealthCard delay={delay} className="border-teal-500/10">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-500/10">
          <Sparkles className="h-4 w-4 text-teal-400" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium">{insight.title}</h3>
            {insight.evidenceLevel && (
              <Badge variant="outline" className="text-[9px] font-mono">
                Ev {insight.evidenceLevel}
              </Badge>
            )}
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{insight.summary}</p>
          {insight.relatedMarkers && insight.relatedMarkers.length > 0 && (
            <p className="mt-2 text-[10px] text-muted-foreground/60">
              Related: {insight.relatedMarkers.join(", ")}
            </p>
          )}
        </div>
      </div>
    </HealthCard>
  );
}
