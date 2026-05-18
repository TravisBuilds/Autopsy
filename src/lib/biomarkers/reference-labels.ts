import type { BiomarkerFlag } from "@/types/health";

/** Neutral copy — lab reference bands, not clinical diagnosis */
export function flagLabel(flag: BiomarkerFlag): string {
  switch (flag) {
    case "high":
      return "Above lab reference";
    case "low":
      return "Below lab reference";
    case "critical":
      return "Outside lab reference";
    default:
      return "Within lab reference";
  }
}

export function referenceStatusLabel(inRange: boolean, value: number, low: number, high: number): string {
  if (inRange) return "Within lab reference";
  if (value > high) return "Above lab reference";
  if (value < low) return "Below lab reference";
  return "Outside lab reference";
}

export function flagShort(flag: BiomarkerFlag): string {
  switch (flag) {
    case "high":
      return "Above ref.";
    case "low":
      return "Below ref.";
    case "critical":
      return "Outside ref.";
    default:
      return "In range";
  }
}
