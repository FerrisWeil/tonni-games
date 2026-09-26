import { evaluateGuess } from "@/lib/evaluate";
import { MAX_GUESSES, WORD_LENGTH, type LetterState } from "@/lib/types";
import { Tile } from "./tile";

interface BoardProps {
  guesses: string[];
  currentGuess: string;
  solution: string;
  revealingRow: number | null;
  shakeRow: boolean;
}

export function Board({
  guesses,
  currentGuess,
  solution,
  revealingRow,
  shakeRow,
}: BoardProps) {
  return (
    <div className="mx-auto" aria-label="Guess board">
      <div className="flex flex-col gap-1.5">
        {Array.from({ length: MAX_GUESSES }, (_, row) => (
          <div key={row} className="flex justify-center gap-1.5">
            {renderRow({
              row,
              guesses,
              currentGuess,
              solution,
              revealingRow,
              shakeRow,
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function renderRow({
  row,
  guesses,
  currentGuess,
  solution,
  revealingRow,
  shakeRow,
}: {
  row: number;
  guesses: string[];
  currentGuess: string;
  solution: string;
  revealingRow: number | null;
  shakeRow: boolean;
}) {
  if (revealingRow === row && guesses[row]) {
    const evaluated = evaluateGuess(guesses[row], solution);
    return evaluated.map((cell, col) => (
      <RevealingTile
        key={`rev-${row}-${col}`}
        letter={cell.letter}
        finalState={cell.state}
        index={col}
      />
    ));
  }

  if (row < guesses.length) {
    const evaluated = evaluateGuess(guesses[row], solution);
    return evaluated.map((cell, col) => (
      <Tile key={`${row}-${col}`} letter={cell.letter} state={cell.state} />
    ));
  }

  if (row === guesses.length) {
    const letters = currentGuess.padEnd(WORD_LENGTH).split("");
    return letters.map((ch, col) => {
      const letter = ch.trim();
      return (
        <Tile
          key={`${row}-${col}`}
          letter={letter}
          state={letter ? "tbd" : "empty"}
          popping={!!letter && col === currentGuess.length - 1}
          shake={shakeRow}
        />
      );
    });
  }

  return Array.from({ length: WORD_LENGTH }, (_, col) => (
    <Tile key={`${row}-${col}`} letter="" state="empty" />
  ));
}

function RevealingTile({
  letter,
  finalState,
  index,
}: {
  letter: string;
  finalState: LetterState;
  index: number;
}) {
  return (
    <div
      className="relative flex h-14 w-14 items-center justify-center text-2xl font-bold uppercase select-none sm:h-16 sm:w-16 sm:text-3xl"
      style={{ ["--reveal-delay" as string]: `${index * 300}ms` }}
    >
      <div
        className={`tile-face animate-tile-flip absolute inset-0 flex items-center justify-center border-2 border-[var(--tile-border-filled)] bg-transparent text-[var(--ink)] reveal-${finalState}`}
      >
        {letter}
      </div>
    </div>
  );
}
