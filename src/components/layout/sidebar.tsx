"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity } from "lucide-react";
import { mainNav } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-[240px] shrink-0 flex-col border-r border-white/[0.06] bg-sidebar/80 backdrop-blur-xl">
      <div className="flex h-14 items-center gap-2.5 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/15 ring-1 ring-teal-500/25">
          <Activity className="h-4 w-4 text-teal-400" />
        </div>
        <div>
          <p className="text-sm font-semibold tracking-tight">Autopsy</p>
          <p className="text-[10px] text-muted-foreground">Health intelligence</p>
        </div>
      </div>

      <Separator className="bg-white/[0.06]" />

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-0.5">
          {mainNav.map((item) => {
            const isActive =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all",
                  isActive
                    ? "bg-white/[0.08] text-foreground shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
                    : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-colors",
                    isActive ? "text-teal-400" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                <div className="min-w-0">
                  <p className="truncate font-medium leading-none">{item.title}</p>
                  {item.description && (
                    <p className="mt-1 truncate text-[10px] text-muted-foreground/80">
                      {item.description}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="border-t border-white/[0.06] p-4">
        <p className="font-mono text-[10px] text-muted-foreground/60">Last panel · Mar 11, 2026</p>
      </div>
    </aside>
  );
}
