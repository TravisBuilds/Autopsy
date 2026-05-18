"use client";

import { Loader2 } from "lucide-react";

interface BatchProgressProps {
  current: number;
  total: number;
  fileName: string;
}

export function BatchProgress({ current, total, fileName }: BatchProgressProps) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-card/50 p-8 backdrop-blur-xl">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
        <p className="text-sm font-medium">
          Processing {current} of {total}
        </p>
        <p className="max-w-md truncate text-xs text-muted-foreground">{fileName}</p>
        <div className="h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-teal-500 transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
