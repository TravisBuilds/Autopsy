import { Minus, TrendingDown, TrendingUp, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { TrendClassification } from "@/lib/biomarkers/trends";

const config: Record<
  TrendClassification,
  { icon: typeof TrendingUp; className: string }
> = {
  improving: {
    icon: TrendingDown,
    className: "border-emerald-400/30 bg-emerald-400/10 text-emerald-400",
  },
  worsening: {
    icon: TrendingUp,
    className: "border-amber-400/30 bg-amber-400/10 text-amber-400",
  },
  stable: {
    icon: Minus,
    className: "border-white/10 bg-white/5 text-muted-foreground",
  },
  volatile: {
    icon: Activity,
    className: "border-violet-400/30 bg-violet-400/10 text-violet-400",
  },
  insufficient: {
    icon: Minus,
    className: "border-white/10 bg-white/5 text-muted-foreground",
  },
};

interface TrendBadgeProps {
  classification: TrendClassification;
  label: string;
  className?: string;
}

export function TrendBadge({ classification, label, className }: TrendBadgeProps) {
  const { icon: Icon, className: style } = config[classification];

  return (
    <Badge variant="outline" className={cn("gap-1 text-[10px]", style, className)}>
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}
