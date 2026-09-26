import type { EvaluatedLetter, LetterState } from "./types";

/**
 * Official Wordle-style evaluation with double-letter handling:
 * 1) Mark greens first (consume solution letters).
 * 2) Mark yellows for remaining guess letters that still appear.
 * 3) Everything else is absent (gray).
 */
export function evaluateGuess(
  guess: string,
  solution: string,
): EvaluatedLetter[] {
  const g = guess.toLowerCase();
  const s = solution.toLowerCase();
  const result: EvaluatedLetter[] = Array.from({ length: 5 }, (_, i) => ({
    letter: g[i] ?? "",
    state: "absent" as LetterState,
  }));

  const remaining: Record<string, number> = {};
  for (let i = 0; i < 5; i++) {
    const ch = s[i];
    if (g[i] === ch) {
      result[i].state = "correct";
    } else {
      remaining[ch] = (remaining[ch] ?? 0) + 1;
    }
  }

  for (let i = 0; i < 5; i++) {
    if (result[i].state === "correct") continue;
    const ch = g[i];
    if ((remaining[ch] ?? 0) > 0) {
      result[i].state = "present";
      remaining[ch] -= 1;
    } else {
      result[i].state = "absent";
    }
  }

  return result;
}

/** Prefer stronger states when merging keyboard key colors. */
export function strongerState(
  a: LetterState | undefined,
  b: LetterState,
): LetterState {
  const rank: Record<LetterState, number> = {
    empty: 0,
    tbd: 1,
    absent: 2,
    present: 3,
    correct: 4,
  };
  if (!a) return b;
  return rank[b] > rank[a] ? b : a;
}

export function buildKeyboardStates(
  guesses: string[],
  solution: string,
): Record<string, LetterState> {
  const map: Record<string, LetterState> = {};
  for (const guess of guesses) {
    for (const { letter, state } of evaluateGuess(guess, solution)) {
      map[letter] = strongerState(map[letter], state);
    }
  }
  return map;
}
