import { cn } from "@/lib/utils";

interface ToastProps {
  message: string | null;
}

export function Toast({ message }: ToastProps) {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-16 z-40 flex min-h-10 justify-center"
      aria-live="assertive"
      aria-atomic="true"
      role="status"
    >
      <div
        className={cn(
          "rounded-md bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-white shadow-lg transition-[opacity,transform] duration-150 ease-out will-change-transform",
          message
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-1 opacity-0",
        )}
      >
        {message ?? "\u00a0"}
      </div>
    </div>
  );
}
