import { cn } from "@/lib/utils";
import type { LetterState } from "@/lib/types";

const stateClass: Record<LetterState, string> = {
  empty: "border-2 border-[var(--tile-border)] bg-transparent text-[var(--ink)]",
  tbd: "border-2 border-[var(--tile-border-filled)] bg-transparent text-[var(--ink)]",
  correct: "border-0 bg-[var(--tile-correct)] text-white",
  present: "border-0 bg-[var(--tile-present)] text-white",
  absent: "border-0 bg-[var(--tile-absent)] text-white",
};

interface TileProps {
  letter: string;
  state: LetterState;
  popping?: boolean;
  shake?: boolean;
}

export function Tile({ letter, state, popping = false, shake = false }: TileProps) {
  return (
    <div className={cn("wordle-tile", shake && "animate-tile-shake")}>
      <div
        className={cn(
          "tile-face absolute inset-0 flex items-center justify-center",
          popping && letter && "animate-tile-pop",
          stateClass[state],
        )}
      >
        {letter}
      </div>
    </div>
  );
}
