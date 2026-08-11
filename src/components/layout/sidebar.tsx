"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Settings } from "lucide-react";
import { AppMark } from "@/components/brand/app-mark";
import { mainNav } from "@/lib/navigation";
import { signOutClient } from "@/lib/auth/sign-out-client";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";

export function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);

  const handleSignOut = async () => {
    await signOutClient();
    window.location.href = "/login";
  };

  return (
    <aside className="flex h-full w-[240px] shrink-0 flex-col border-r border-white/[0.06] bg-sidebar/80 backdrop-blur-xl">
      <div className="flex h-14 items-center px-4">
        <AppMark href="/" size={36} />
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
        {user ? (
          <div className="space-y-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{user.displayName}</p>
              {user.email && (
                <p className="truncate text-[10px] text-muted-foreground">{user.email}</p>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <Link
                href="/settings"
                className={cn(
                  "flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors",
                  pathname.startsWith("/settings")
                    ? "bg-white/[0.08] text-foreground"
                    : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
                )}
              >
                <Settings className="h-3.5 w-3.5" />
                Account
              </Link>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 justify-start px-2 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => void handleSignOut()}
              >
                <LogOut className="mr-1.5 h-3.5 w-3.5" />
                Sign out
              </Button>
            </div>
          </div>
        ) : (
          <Link
            href="/login"
            className="block text-center text-xs text-teal-400 hover:underline"
          >
            Sign in to sync data
          </Link>
        )}
      </div>
    </aside>
  );
}
