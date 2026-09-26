import { cn } from "@/lib/utils";

const TILES: { letter: string; tone: "green" | "ochre" | "ink" }[] = [
  { letter: "T", tone: "green" },
  { letter: "O", tone: "ochre" },
  { letter: "N", tone: "ink" },
  { letter: "N", tone: "green" },
  { letter: "I", tone: "ochre" },
];

const TONE_CLASS: Record<(typeof TILES)[number]["tone"], string> = {
  green: "bg-[var(--tile-correct)]",
  ochre: "bg-[var(--tile-present)]",
  ink: "bg-[var(--tile-absent)]",
};

/** Wordle-style TONNI brand mark for Account / sign-in. */
export function TonniTiles({ className }: { className?: string }) {
  return (
    <div
      className={cn("flex items-center justify-center gap-1.5", className)}
      aria-label="TONNI"
      role="img"
    >
      {TILES.map((tile, i) => (
        <span
          key={`${tile.letter}-${i}`}
          className={cn(
            "inline-flex h-11 w-11 items-center justify-center rounded-md text-lg font-bold tracking-wide text-white sm:h-12 sm:w-12 sm:text-xl",
            TONE_CLASS[tile.tone],
          )}
          aria-hidden
        >
          {tile.letter}
        </span>
      ))}
    </div>
  );
}
