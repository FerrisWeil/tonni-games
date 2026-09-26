import { Delete } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LetterState } from "@/lib/types";

const ROWS = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["enter", "z", "x", "c", "v", "b", "n", "m", "backspace"],
];

const keyStateClass: Record<string, string> = {
  correct: "bg-[var(--tile-correct)] text-white border-transparent",
  present: "bg-[var(--tile-present)] text-white border-transparent",
  absent: "bg-[var(--tile-absent)] text-white border-transparent",
};

interface KeyboardProps {
  letterStates: Record<string, LetterState>;
  onKey: (key: string) => void;
  disabled?: boolean;
}

export function Keyboard({ letterStates, onKey, disabled }: KeyboardProps) {
  return (
    <div
      className="mx-auto flex w-full max-w-lg flex-col gap-1.5 px-1 sm:gap-1.5"
      aria-label="Keyboard"
    >
      {ROWS.map((row, i) => (
        <div key={i} className="flex w-full justify-center gap-1 sm:gap-1.5">
          {row.map((key) => {
            const isWide = key === "enter" || key === "backspace";
            const state = letterStates[key];
            return (
              <button
                key={key}
                type="button"
                disabled={disabled}
                onClick={() => onKey(key)}
                onPointerDown={(e) => {
                  // Avoid sticky hover / ghost clicks on touch
                  if (e.pointerType === "touch") e.currentTarget.focus({ preventScroll: true });
                }}
                className={cn(
                  "wordle-key flex items-center justify-center rounded-md text-sm font-bold uppercase transition-colors active:scale-95 disabled:opacity-60",
                  isWide
                    ? "min-w-[2.75rem] flex-[1.55] px-1 text-[0.65rem] sm:min-w-[3.25rem] sm:px-2 sm:text-xs"
                    : "min-w-0 flex-1 text-xs sm:text-sm",
                  state && keyStateClass[state]
                    ? keyStateClass[state]
                    : "bg-[var(--key-bg)] text-[var(--ink)]",
                )}
                style={{ height: "var(--key-h)", minHeight: "44px" }}
                aria-label={
                  key === "backspace" ? "Backspace" : key === "enter" ? "Enter" : key
                }
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
