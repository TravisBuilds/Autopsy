"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { TimelineEvent } from "@/types/health";

interface TimelinePreviewProps {
  events: TimelineEvent[];
}

const typeColors: Record<string, string> = {
  biomarker: "bg-amber-400",
  intervention: "bg-teal-400",
  imaging: "bg-violet-400",
  wearable: "bg-sky-400",
  lifestyle: "bg-rose-400",
};

export function TimelinePreview({ events }: TimelinePreviewProps) {
  return (
    <div className="relative">
      <div className="absolute left-[7px] top-2 bottom-2 w-px bg-white/[0.08]" />
      <ul className="space-y-4">
        {events.map((event, i) => (
          <motion.li
            key={event.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="relative flex gap-4 pl-6"
          >
            <span
              className={cn(
                "absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full ring-4 ring-background",
                typeColors[event.type] ?? "bg-muted"
              )}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-[10px] text-muted-foreground">{event.date}</span>
                <span className="text-sm font-medium">{event.label}</span>
              </div>
              {event.markers && (
                <p className="mt-1 text-xs text-muted-foreground">{event.markers.join(" · ")}</p>
              )}
            </div>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
