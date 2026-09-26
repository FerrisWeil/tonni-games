import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Anchored header + body-only scroll (ADR 0021).
 * Sibling Themes/Wordle/Connections refactors may deepen this; Account uses it now.
 */
export function AppShell({
  title,
  subtitle,
  backTo = "/",
  backLabel = "Back to home",
  headerEnd,
  children,
  className,
  bodyClassName,
  centerBody = false,
}: {
  title: string;
  subtitle?: string;
  backTo?: string;
  backLabel?: string;
  headerEnd?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  /** Vertically center body content (sign-in). */
  centerBody?: boolean;
}) {
  return (
    <div
      className={cn(
        "mx-auto flex h-dvh max-h-dvh w-full max-w-lg flex-col overflow-hidden overscroll-none",
        className,
      )}
    >
      <header
        className="flex shrink-0 items-center gap-2 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2"
        style={{ touchAction: "manipulation" }}
      >
        <Link
          to={backTo}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-[var(--ink)] hover:bg-[var(--key-bg)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-brand)]"
          aria-label={backLabel}
        >
          <ArrowLeft className="h-5 w-5" aria-hidden />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-semibold text-[var(--ink)]">{title}</h1>
          {subtitle ? (
            <p className="truncate text-sm text-[var(--ink-muted)]">{subtitle}</p>
          ) : null}
        </div>
        {headerEnd ? <div className="shrink-0">{headerEnd}</div> : null}
      </header>

      <main
        className={cn(
          "min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]",
          centerBody && "flex flex-col",
          bodyClassName,
        )}
      >
        {centerBody ? (
          <div className="my-auto flex w-full flex-col">{children}</div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}
