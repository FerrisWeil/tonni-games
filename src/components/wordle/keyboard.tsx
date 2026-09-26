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
    <div className="mx-auto flex w-full max-w-lg flex-col gap-1.5 px-1" aria-label="Keyboard">
      {ROWS.map((row, i) => (
        <div key={i} className="flex justify-center gap-1.5">
          {row.map((key) => {
            const isWide = key === "enter" || key === "backspace";
            const state = letterStates[key];
            return (
              <button
                key={key}
                type="button"
                disabled={disabled}
                onClick={() => onKey(key)}
                className={cn(
                  "flex h-14 items-center justify-center rounded-md text-sm font-bold uppercase transition-colors active:scale-95 disabled:opacity-60",
                  isWide ? "min-w-[3.25rem] flex-[1.4] px-2 text-xs" : "min-w-8 flex-1",
                  state && keyStateClass[state]
                    ? keyStateClass[state]
                    : "bg-[var(--key-bg)] text-[var(--ink)]",
                )}
                aria-label={
                  key === "backspace" ? "Backspace" : key === "enter" ? "Enter" : key
                }
              >
                {key === "backspace" ? (
                  <Delete className="h-5 w-5" aria-hidden />
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
