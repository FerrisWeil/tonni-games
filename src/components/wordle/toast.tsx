type ToastProps = {
  message: string | null;
};

export function Toast({ message }: ToastProps) {
  if (!message) return null;
  return (
    <div
      className="pointer-events-none absolute top-16 left-1/2 z-40 -translate-x-1/2 rounded-md bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-[var(--bg)] shadow-lg"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {message}
    </div>
  );
}
