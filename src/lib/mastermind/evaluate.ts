import type { Feedback, PegId } from "./types";

/**
 * Classic Mastermind feedback:
 * 1) Count exact matches (same color + position); consume those slots.
 * 2) Count near matches from remaining guess pegs against remaining secret pegs.
 * Feedback is unordered counts (exact then near), not position-aligned.
 */
export function evaluateGuess(guess: PegId[], secret: PegId[]): Feedback {
  if (guess.length !== secret.length) {
    throw new Error(
      `Guess length ${guess.length} does not match secret length ${secret.length}`,
    );
  }

  const n = secret.length;
  const secretRemaining: PegId[] = [];
  const guessRemaining: PegId[] = [];
  let exact = 0;

  for (let i = 0; i < n; i++) {
    if (guess[i] === secret[i]) {
      exact += 1;
    } else {
      secretRemaining.push(secret[i]!);
      guessRemaining.push(guess[i]!);
    }
  }

  const unusedSecret = new Map<PegId, number>();
  for (const peg of secretRemaining) {
    unusedSecret.set(peg, (unusedSecret.get(peg) ?? 0) + 1);
  }

  let near = 0;
  for (const peg of guessRemaining) {
    const count = unusedSecret.get(peg) ?? 0;
    if (count > 0) {
      near += 1;
      unusedSecret.set(peg, count - 1);
    }
  }

  return { exact, near };
}

export function isWinningFeedback(feedback: Feedback, codeLength: number): boolean {
  return feedback.exact === codeLength;
}

/** Validate a complete guess against difficulty rules. */
export function isValidGuess(
  pegs: Array<PegId | null>,
  codeLength: number,
  colorCount: number,
  allowDuplicates: boolean,
): pegs is PegId[] {
  if (pegs.length !== codeLength) return false;
  if (pegs.some((p) => p === null || p < 0 || p >= colorCount)) return false;
  if (!allowDuplicates) {
    const set = new Set(pegs as PegId[]);
    if (set.size !== pegs.length) return false;
  }
  return true;
}

export function generateSecret(
  codeLength: number,
  colorCount: number,
  allowDuplicates: boolean,
  random: () => number = Math.random,
): PegId[] {
  if (codeLength < 1 || colorCount < 1) {
    throw new Error("Invalid codeLength or colorCount");
  }
  if (!allowDuplicates && codeLength > colorCount) {
    throw new Error("Cannot generate unique secret longer than color count");
  }

  if (allowDuplicates) {
    return Array.from({ length: codeLength }, () =>
      Math.floor(random() * colorCount),
    );
  }

  const pool = Array.from({ length: colorCount }, (_, i) => i);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const tmp = pool[i]!;
    pool[i] = pool[j]!;
    pool[j] = tmp;
  }
  return pool.slice(0, codeLength);
}
