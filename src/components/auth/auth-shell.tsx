import { Logo } from "@/components/brand/logo";
import { APP_DESCRIPTION, APP_NAME } from "@/lib/brand";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-card/50 p-8">
        <div className="flex flex-col items-center text-center">
          <Logo size={64} priority />
          <h1 className="mt-4 text-2xl font-light tracking-tight">{APP_NAME}</h1>
          <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {title}
          </p>
          {subtitle ? (
            <p className="mt-2 text-xs text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">{APP_DESCRIPTION}</p>
        {children}
      </div>
    </div>
  );
}
