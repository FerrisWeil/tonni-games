import { cn } from "@/lib/utils";

/** Fixed hit target for Themes selection check — always in layout (ADR 0022). */
export const THEME_SELECT_INDICATOR_SLOT =
  "theme-select-indicator inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full";

/**
 * Classes for the Themes check indicator.
 * Unselected keeps the same box via `invisible` (no layout shift).
 */
export function themeSelectIndicatorClass(selected: boolean): string {
  return cn(
    THEME_SELECT_INDICATOR_SLOT,
    selected
      ? "bg-[var(--accent-brand)] text-white"
      : "invisible pointer-events-none",
  );
}

/** Shared Themes row shell — fixed min height; selection only changes paint. */
export const THEME_ROW_BASE =
  "theme-row relative flex w-full rounded-lg border p-4 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-brand)]";

export function themeRowSelectedClass(selected: boolean): string {
  return selected
    ? "border-[var(--accent-brand)] bg-[var(--panel)] shadow-[0_0_0_1px_var(--accent-brand)]"
    : "border-[var(--panel-border)] bg-[var(--panel)]/60 hover:border-[var(--ink-muted)]";
}
