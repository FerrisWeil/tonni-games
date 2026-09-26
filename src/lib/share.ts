import { evaluateGuess } from "./evaluate";
import type { LetterState } from "./types";

const EMOJI: Record<"correct" | "present" | "absent", string> = {
  correct: "🟩",
  present: "🟨",
  absent: "⬛",
};

const STATE_WORD: Record<"correct" | "present" | "absent", string> = {
  correct: "correct",
  present: "present",
  absent: "absent",
};

export interface SharePayload {
  /** Spoiler-free emoji grid (classic share culture). */
  emojiGrid: string;
  /** One-line accessible summary (wa11y-style companion). */
  plainSummary: string;
  /** Full clipboard blob: title + grid + plain summary. */
  clipboard: string;
}

function rowStates(guess: string, solution: string): Array<"correct" | "present" | "absent"> {
  return evaluateGuess(guess, solution).map((c) => {
    const s = c.state as LetterState;
    if (s === "correct" || s === "present" || s === "absent") return s;
    return "absent";
  });
}

/** Build spoiler-free share text for a finished daily game. */
export function buildShareText(opts: {
  puzzleNumber: number;
  guesses: string[];
  solution: string;
  won: boolean;
}): SharePayload {
  const score = opts.won ? String(opts.guesses.length) : "X";
  const title = `Tonni Games Wordle #${opts.puzzleNumber} ${score}/6`;

  const emojiRows = opts.guesses.map((guess) =>
    rowStates(guess, opts.solution)
      .map((s) => EMOJI[s])
      .join(""),
  );
  const emojiGrid = emojiRows.join("\n");

  const plainRows = opts.guesses.map((guess, i) => {
    const words = rowStates(guess, opts.solution)
      .map((s) => STATE_WORD[s])
      .join(", ");
    return `Row ${i + 1}: ${words}`;
  });
  const plainSummary = [
    `Tonni Wordle #${opts.puzzleNumber} — ${score}/6.`,
    ...plainRows,
  ].join(" ");

  const clipboard = [title, "", emojiGrid, "", plainSummary].join("\n");

  return { emojiGrid, plainSummary, clipboard };
}

export async function copyShareText(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through
  }
  try {
    const el = document.createElement("textarea");
    el.value = text;
    el.setAttribute("readonly", "");
    el.style.position = "fixed";
    el.style.left = "-9999px";
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(el);
    return ok;
  } catch {
    return false;
  }
}
