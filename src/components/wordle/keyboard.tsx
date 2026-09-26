import { useRef } from "react";
import { Delete } from "lucide-react";
import { cn } from "@/lib/utils";
import { letterStateLabel } from "@/lib/letter-state";
import type { LetterState } from "@/lib/types";

const ROWS = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["enter", "z", "x", "c", "v", "b", "n", "m", "backspace"],
];

const keyStateClass: Record<string, string> = {
  correct:
    "bg-[var(--tile-correct)] text-white border-transparent tile-pattern-correct",
  present:
    "bg-[var(--tile-present)] text-white border-transparent tile-pattern-present",
  absent:
    "bg-[var(--tile-absent)] text-white border-transparent tile-pattern-absent",
};

interface KeyboardProps {
  letterStates: Record<string, LetterState>;
  onKey: (key: string) => void;
  disabled?: boolean;
}

export function Keyboard({ letterStates, onKey, disabled }: KeyboardProps) {
  // Suppress click after pointerdown so touch/mouse don't double-fire.
  const pointerHandled = useRef(false);

  return (
    <div
      className="mx-auto flex w-full max-w-lg flex-col gap-1.5 px-1 sm:gap-1.5"
      role="group"
      aria-label="On-screen keyboard"
    >
      {ROWS.map((row, i) => (
        <div
          key={i}
          className="flex w-full justify-center gap-1 sm:gap-1.5"
          role="row"
        >
          {row.map((key) => {
            const isWide = key === "enter" || key === "backspace";
            const state = letterStates[key];
            const label =
              key === "backspace"
                ? "Backspace"
                : key === "enter"
                  ? "Enter"
                  : state
                    ? `${key.toUpperCase()}, ${letterStateLabel(state)}`
                    : key.toUpperCase();

            return (
              <button
                key={key}
                type="button"
                disabled={disabled}
                onPointerDown={(e) => {
                  if (disabled || e.button !== 0) return;
                  pointerHandled.current = true;
                  onKey(key);
                }}
                onClick={() => {
                  if (disabled) return;
                  if (pointerHandled.current) {
                    pointerHandled.current = false;
                    return;
                  }
                  onKey(key);
                }}
                className={cn(
                  "wordle-key flex items-center justify-center rounded-md text-sm font-bold uppercase transition-transform duration-75 ease-out will-change-transform active:scale-95 disabled:opacity-60",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-brand)]",
                  isWide
                    ? "min-w-[2.75rem] flex-[1.55] px-1 text-[0.65rem] sm:min-w-[3.25rem] sm:px-2 sm:text-xs"
                    : "min-w-0 flex-1 text-xs sm:text-sm",
                  state && keyStateClass[state]
                    ? keyStateClass[state]
                    : "bg-[var(--key-bg)] text-[var(--ink)]",
                )}
                style={{ height: "var(--key-h)", minHeight: "44px" }}
                aria-label={label}
                data-state={state ?? "unused"}
              >
                {key === "backspace" ? (
                  <Delete className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
                ) : (
                  key
                )}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
