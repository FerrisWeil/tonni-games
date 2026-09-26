import type { ReactNode } from "react";
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
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/25 backdrop-blur-[2px]"
        aria-label="Close dialog"
        onClick={() => onOpenChange(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={cn(
          "relative z-10 max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-xl border border-[var(--panel-border)] bg-[var(--panel)] p-5 text-[var(--ink)] shadow-xl",
          className,
        )}
      >
        <button
          type="button"
          className="absolute top-3 right-3 rounded-md p-1 text-[var(--ink-muted)] hover:bg-[var(--key-bg)] hover:text-[var(--ink)]"
          onClick={() => onOpenChange(false)}
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
        <h2 id="modal-title" className="font-display pr-8 text-2xl font-semibold tracking-tight">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-sm text-[var(--ink-muted)]">{description}</p>
        ) : null}
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
