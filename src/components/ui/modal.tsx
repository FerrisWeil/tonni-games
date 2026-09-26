import {
  useEffect,
  useId,
  useRef,
  type ReactNode,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}: ModalProps) {
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    const focusables = () =>
      panel?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ) ?? [];

    // Focus first focusable (close button) after paint
    const t = requestAnimationFrame(() => {
      const list = [...focusables()];
      list[0]?.focus({ preventScroll: true });
    });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onOpenChange(false);
        return;
      }
      if (e.key !== "Tab" || !panel) return;
      const list = [...focusables()];
      if (list.length === 0) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      cancelAnimationFrame(t);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
      previouslyFocused.current?.focus?.({ preventScroll: true });
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  const onPanelKeyDown = (e: ReactKeyboardEvent) => {
    // Stop game hotkeys while dialog is open
    e.stopPropagation();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/25 backdrop-blur-[2px]"
        aria-label="Close dialog"
        onClick={() => onOpenChange(false)}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        onKeyDown={onPanelKeyDown}
        className={cn(
          "relative z-10 max-h-[min(90dvh,100%)] w-full max-w-md overflow-y-auto rounded-t-xl border border-[var(--panel-border)] bg-[var(--panel)] p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-[var(--ink)] shadow-xl sm:rounded-xl",
          "translate-y-0 transition-transform duration-200 ease-out will-change-transform",
          className,
        )}
      >
        <button
          type="button"
          className="absolute top-2 right-2 flex h-11 w-11 items-center justify-center rounded-md text-[var(--ink-muted)] hover:bg-[var(--key-bg)] hover:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-brand)]"
          onClick={() => onOpenChange(false)}
          aria-label="Close"
        >
          <X className="h-5 w-5" aria-hidden />
        </button>
        <h2
          id={titleId}
          className="font-display pr-10 text-2xl font-semibold tracking-tight"
        >
          {title}
        </h2>
        {description ? (
          <p id={descId} className="mt-1 text-sm text-[var(--ink-muted)]">
            {description}
          </p>
        ) : null}
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
