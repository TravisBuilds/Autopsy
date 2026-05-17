"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface HealthCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  glow?: boolean;
  delay?: number;
}

export function HealthCard({
  children,
  className,
  onClick,
  glow = false,
  delay = 0,
}: HealthCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2 }}
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-card/60 p-5 backdrop-blur-xl transition-colors",
        "hover:border-white/[0.12] hover:bg-card/80",
        glow && "shadow-[0_0_40px_-12px_var(--accent-glow)]",
        onClick && "cursor-pointer",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="relative z-10">{children}</div>
    </motion.article>
  );
}
