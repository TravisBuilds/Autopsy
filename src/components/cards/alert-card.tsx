"use client";

import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import { HealthCard } from "@/components/cards/health-card";
import { cn } from "@/lib/utils";
import type { HealthAlert } from "@/types/health";

const severityConfig = {
  info: { icon: Info, color: "text-sky-400", border: "border-sky-400/20" },
  warning: { icon: AlertTriangle, color: "text-amber-400", border: "border-amber-400/20" },
  critical: { icon: AlertCircle, color: "text-red-400", border: "border-red-400/20" },
};

interface AlertCardProps {
  alert: HealthAlert;
  delay?: number;
  genomeNote?: string;
}

export function AlertCard({ alert, delay = 0, genomeNote }: AlertCardProps) {
  const config = severityConfig[alert.severity];
  const Icon = config.icon;

  return (
    <HealthCard delay={delay} className={cn("border-l-2", config.border)}>
      <div className="flex gap-3">
        <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", config.color)} />
        <div>
          <h3 className="text-sm font-medium">{alert.title}</h3>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{alert.description}</p>
          {genomeNote && (
            <p className="mt-2 rounded-lg border border-violet-500/20 bg-violet-500/5 px-2 py-1.5 text-[10px] leading-relaxed text-violet-100/80">
              Genome-linked: {genomeNote}
            </p>
          )}
          <p className="mt-2 font-mono text-[10px] text-muted-foreground/60">{alert.timestamp}</p>
        </div>
      </div>
    </HealthCard>
  );
}
