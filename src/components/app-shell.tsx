import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Document lock so only AppShell body scrolls (ADR 0021). */
export const APP_SHELL_LOCK = "app-shell-lock";

export const APP_SHELL_CLASS =
  "app-shell mx-auto flex h-dvh max-h-dvh w-full max-w-lg flex-col overflow-hidden";

export const APP_SHELL_HEADER_CLASS =
  "app-shell-header shrink-0 border-b border-[var(--panel-border)]";

export const APP_SHELL_BODY_CLASS =
  "app-shell-body min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain";

export const APP_SHELL_FOOTER_CLASS = "app-shell-footer shrink-0";

type AppShellProps = {
  header: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  /** Lock document scroll while mounted (default true). */
  lockDocumentScroll?: boolean;
};

/**
 * Anchored header (+ optional footer); only the body pane scrolls (ADR 0021).
 */
export function AppShell({
  header,
  children,
  footer,
  className,
  headerClassName,
  bodyClassName,
  footerClassName,
  lockDocumentScroll = true,
}: AppShellProps) {
  useEffect(() => {
    if (!lockDocumentScroll) return;
    const root = document.documentElement;
    root.classList.add(APP_SHELL_LOCK);
    return () => {
      root.classList.remove(APP_SHELL_LOCK);
    };
  }, [lockDocumentScroll]);

  return (
    <div className={cn(APP_SHELL_CLASS, className)}>
      <header className={cn(APP_SHELL_HEADER_CLASS, headerClassName)}>
        {header}
      </header>
      <div className={cn(APP_SHELL_BODY_CLASS, bodyClassName)}>{children}</div>
      {footer ? (
        <footer className={cn(APP_SHELL_FOOTER_CLASS, footerClassName)}>
          {footer}
        </footer>
      ) : null}
    </div>
  );
}
