import clsx from "clsx";
import type { LetterState } from "@/lib/types";
import { letterStateLabel } from "@/lib/letter-state";

type TileProps = {
  letter?: string;
  state?: LetterState | "empty" | "tbd";
  revealDelayMs?: number;
  revealing?: boolean;
  row: number;
  col: number;
};

export function Tile({
  letter = "",
  state = "empty",
  revealDelayMs = 0,
  revealing = false,
  row,
  col,
}: TileProps) {
  const filled = letter.length > 0;
  const label = letterStateLabel(letter, state === "empty" || state === "tbd" ? undefined : state);

  return (
    <div
      className={clsx(
        "tile relative flex aspect-square w-full max-w-[min(14vw,3.75rem)] items-center justify-center",
        "rounded-[3px] border-2 text-2xl font-bold uppercase select-none sm:text-3xl",
        state === "empty" && "border-[var(--tile-border)] bg-transparent",
        state === "tbd" && "border-[var(--ink-muted)] bg-transparent",
        state === "correct" && "border-[var(--tile-correct)] bg-[var(--tile-correct)] text-white",
        state === "present" && "border-[var(--tile-present)] bg-[var(--tile-present)] text-white",
        state === "absent" && "border-[var(--tile-absent)] bg-[var(--tile-absent)] text-white",
        revealing && "tile-reveal",
        filled && state === "tbd" && "tile-pop",
      )}
      style={revealing ? ({ "--reveal-delay": `${revealDelayMs}ms` } as React.CSSProperties) : undefined}
      role="img"
      aria-label={label}
      data-row={row}
      data-col={col}
      data-state={state}
    >
      <span aria-hidden={true}>{letter}</span>
      {state !== "empty" && state !== "tbd" && state !== "absent" && (
        <span
          className={clsx(
            "pointer-events-none absolute inset-0 opacity-40",
            state === "correct" && "tile-pattern-correct",
            state === "present" && "tile-pattern-present",
          )}
          aria-hidden
        />
      )}
    </div>
  );
}
