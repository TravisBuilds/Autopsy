"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { formatTimelineDate } from "@/lib/biomarkers/dates";
import { cn } from "@/lib/utils";
import type { TimelineEvent } from "@/types/health";

interface TimelinePreviewProps {
  events: TimelineEvent[];
  /** Map timeline event id → session id for deep links */
  sessionIdByEventId?: Record<string, string>;
}

const typeColors: Record<string, string> = {
  biomarker: "bg-amber-400",
  intervention: "bg-teal-400",
  imaging: "bg-violet-400",
  wearable: "bg-sky-400",
  lifestyle: "bg-rose-400",
};

export function TimelinePreview({ events, sessionIdByEventId }: TimelinePreviewProps) {
  const preview = events.slice(0, 4);

  return (
    <div className="relative">
      <div className="absolute left-[7px] top-2 bottom-2 w-px bg-white/[0.08]" />
      <ul className="space-y-4">
        {preview.map((event, i) => {
          const sessionId = sessionIdByEventId?.[event.id];
          const href = sessionId ? `/timeline?panel=${sessionId}` : "/timeline";

          return (
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
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {formatTimelineDate(event.date)}
                  </span>
                  <Link
                    href={href}
                    className="text-sm font-medium transition hover:text-teal-300"
                  >
                    {event.label}
                  </Link>
                </div>
                {event.markers && (
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {event.markers.join(" · ")}
                  </p>
                )}
              </div>
            </motion.li>
          );
        })}
      </ul>
      {events.length > preview.length && (
        <Link
          href="/timeline"
          className="mt-4 inline-flex items-center text-xs text-teal-400 hover:underline"
        >
          View all {events.length} panels on timeline
          <ArrowRight className="ml-1 h-3 w-3" />
        </Link>
      )}
    </div>
  );
}
