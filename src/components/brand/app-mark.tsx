import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { APP_NAME, APP_TAGLINE } from "@/lib/brand";
import { cn } from "@/lib/utils";

interface AppMarkProps {
  href?: string;
  size?: number;
  showTagline?: boolean;
  className?: string;
}

export function AppMark({ href, size = 32, showTagline = true, className }: AppMarkProps) {
  const content = (
    <div className={cn("flex items-center gap-2.5", className)}>
      <Logo size={size} priority />
      <div>
        <p className="text-sm font-semibold tracking-tight">{APP_NAME}</p>
        {showTagline && (
          <p className="text-[10px] text-muted-foreground">{APP_TAGLINE}</p>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="transition opacity-90 hover:opacity-100">
        {content}
      </Link>
    );
  }

  return content;
}
