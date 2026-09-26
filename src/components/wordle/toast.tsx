import { cn } from "@/lib/utils";

interface ToastProps {
  message: string | null;
}

export function Toast({ message }: ToastProps) {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-16 z-40 flex justify-center"
      aria-live="polite"
    >
      <div
        className={cn(
          "rounded-md bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all duration-200",
          message
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-2 opacity-0",
        )}
      >
        {message ?? ""}
      </div>
    </div>
  );
}
