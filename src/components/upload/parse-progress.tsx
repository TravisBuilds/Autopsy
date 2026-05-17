"use client";

import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BiomarkerCategory } from "@/types/health";

const CATEGORY_LABELS: Record<BiomarkerCategory, string> = {
  cardiovascular: "Lipids",
  metabolic: "Metabolic",
  liver: "Liver",
  hematology: "CBC / Hematology",
  kidney: "Kidney",
  inflammation: "Inflammation",
  hormones: "Hormones",
  vitamins: "Vitamins",
};

interface ParseProgressProps {
  step: "extracting" | "parsing";
  detectedCategories?: BiomarkerCategory[];
}

export function ParseProgress({ step, detectedCategories = [] }: ParseProgressProps) {
  const steps = [
    { id: "extracting", label: "Reading PDF" },
    { id: "parsing", label: "Extracting biomarkers" },
  ] as const;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-2xl border border-white/[0.06] bg-card/50 p-8 backdrop-blur-xl"
    >
      <div className="flex flex-col items-center gap-6">
        <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
        <p className="text-sm font-medium">
          {step === "extracting" ? "Extracting text from PDF…" : "Parsing biomarker rows…"}
        </p>

        <ul className="w-full max-w-xs space-y-2">
          {steps.map((s) => {
            const done =
              s.id === "extracting"
                ? step === "parsing"
                : false;
            const active = s.id === step;

            return (
              <li
                key={s.id}
                className={cn(
                  "flex items-center gap-2 text-xs",
                  active ? "text-foreground" : done ? "text-teal-400" : "text-muted-foreground"
                )}
              >
                {done ? (
                  <Check className="h-3.5 w-3.5" />
                ) : active ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <span className="h-3.5 w-3.5 rounded-full border border-white/20" />
                )}
                {s.label}
              </li>
            );
          })}
        </ul>

        {detectedCategories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
          >
            <p className="mb-2 text-center text-[10px] uppercase tracking-widest text-muted-foreground">
              Detected
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {detectedCategories.map((cat) => (
                <span
                  key={cat}
                  className="flex items-center gap-1 rounded-full bg-teal-500/10 px-2.5 py-1 text-[10px] text-teal-300 ring-1 ring-teal-500/20"
                >
                  <Check className="h-3 w-3" />
                  {CATEGORY_LABELS[cat]}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
