import type { CSSProperties } from "react";
import { evaluateGuess } from "@/lib/evaluate";
import { tileAriaLabel } from "@/lib/letter-state";
import { MAX_GUESSES, WORD_LENGTH, type LetterState } from "@/lib/types";
import { Tile } from "./tile";

interface BoardProps {
  guesses: string[];
  currentGuess: string;
  solution: string;
  revealingRow: number | null;
  shakeRow: boolean;
  /** Defaults to daily Wordle (5). */
  wordLength?: number;
  /** Defaults to daily Wordle (6). */
  maxGuesses?: number;
}

export function Board({
  guesses,
  currentGuess,
  solution,
  revealingRow,
  shakeRow,
  wordLength = WORD_LENGTH,
  maxGuesses = MAX_GUESSES,
}: BoardProps) {
  return (
    <div
      className="mx-auto w-full max-w-[min(100%,26rem)] px-1"
      role="group"
      aria-label={`Guess board, ${guesses.length} of ${maxGuesses} guesses used`}
      style={
        {
          ["--tile-size" as string]: tileSizeForLength(wordLength),
          ["--tile-font" as string]: tileFontForLength(wordLength),
        } as CSSProperties
      }
    >
      <div
        className="flex flex-col"
        style={{ gap: "var(--tile-gap)" }}
        role="grid"
        aria-rowcount={maxGuesses}
        aria-colcount={wordLength}
      >
        {Array.from({ length: maxGuesses }, (_, row) => (
          <div
            key={row}
            className="flex justify-center"
            style={{ gap: "var(--tile-gap)" }}
            role="row"
            aria-rowindex={row + 1}
          >
            {renderRow({
              row,
              guesses,
              currentGuess,
              solution,
              revealingRow,
              shakeRow,
              wordLength,
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function tileSizeForLength(n: number): string {
  if (n <= 5) return "clamp(2.65rem, 13.5vmin, 3.85rem)";
  if (n <= 7) return "clamp(2.1rem, 11vmin, 3.1rem)";
  return "clamp(1.7rem, 9vmin, 2.55rem)";
}

function tileFontForLength(n: number): string {
  if (n <= 5) return "clamp(1.15rem, 5.5vmin, 1.85rem)";
  if (n <= 7) return "clamp(0.95rem, 4.5vmin, 1.45rem)";
  return "clamp(0.8rem, 3.8vmin, 1.2rem)";
}

function renderRow({
  row,
  guesses,
  currentGuess,
  solution,
  revealingRow,
  shakeRow,
  wordLength,
}: {
  row: number;
  guesses: string[];
  currentGuess: string;
  solution: string;
  revealingRow: number | null;
  shakeRow: boolean;
  wordLength: number;
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
    const letters = currentGuess.padEnd(wordLength).split("");
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

  return Array.from({ length: wordLength }, (_, col) => (
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
  const pattern =
    finalState === "correct"
      ? "tile-pattern-correct"
      : finalState === "present"
        ? "tile-pattern-present"
        : "tile-pattern-absent";

  return (
    <div
      className="wordle-tile"
      style={{ ["--reveal-delay" as string]: `${index * 220}ms` }}
      role="img"
      aria-label={tileAriaLabel(letter, finalState)}
      data-state={finalState}
    >
      <div
        className={`tile-face animate-tile-flip absolute inset-0 flex items-center justify-center border-2 border-[var(--tile-border-filled)] bg-transparent text-[var(--ink)] reveal-${finalState} ${pattern}`}
        aria-hidden="true"
      >
        {letter}
      </div>
    </div>
  );
}
