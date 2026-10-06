import {
  DIFFICULTIES,
  type Difficulty,
  type Feedback,
  type PegColor,
} from "./types";

export type Rng = () => number;

/** Fisher–Yates shuffle (mutates). */
function shuffleInPlace<T>(arr: T[], rng: Rng): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = tmp;
  }
  return arr;
}

/**
 * Generate a secret code for the chosen difficulty.
 * Easy: unique colors only. Medium/Hard: duplicates allowed.
 */
export function generateSecret(
  difficulty: Difficulty,
  rng: Rng = Math.random,
): PegColor[] {
  const { codeLength, colorCount, allowDuplicates } = DIFFICULTIES[difficulty];

  if (!allowDuplicates) {
    if (colorCount < codeLength) {
      throw new Error(
        `Cannot generate unique code of length ${codeLength} from ${colorCount} colors`,
      );
    }
    const pool = Array.from({ length: colorCount }, (_, i) => i);
    shuffleInPlace(pool, rng);
    return pool.slice(0, codeLength);
  }

  const code: PegColor[] = [];
  for (let i = 0; i < codeLength; i++) {
    code.push(Math.floor(rng() * colorCount));
  }
  return code;
}

/**
 * Classic Mastermind feedback with duplicate handling:
 * 1) Count exact (same color + position) first, consuming secret slots.
 * 2) Count near (same color, wrong position) from remaining.
 * Feedback is unordered counts — not position-aligned.
 */
export function evaluateGuess(
  guess: readonly PegColor[],
  secret: readonly PegColor[],
): Feedback {
  if (guess.length !== secret.length) {
    throw new Error(
      `Guess length ${guess.length} !== secret length ${secret.length}`,
    );
  }

  const n = secret.length;
  const secretUsed = Array.from({ length: n }, () => false);
  const guessUsed = Array.from({ length: n }, () => false);
  let exact = 0;
  let near = 0;

  for (let i = 0; i < n; i++) {
    if (guess[i] === secret[i]) {
      exact += 1;
      secretUsed[i] = true;
      guessUsed[i] = true;
    }
  }

  for (let i = 0; i < n; i++) {
    if (guessUsed[i]) continue;
    for (let j = 0; j < n; j++) {
      if (secretUsed[j]) continue;
      if (guess[i] === secret[j]) {
        near += 1;
        secretUsed[j] = true;
        break;
      }
    }
  }

  return { exact, near };
}

export function isWinningFeedback(
  feedback: Feedback,
  codeLength: number,
): boolean {
  return feedback.exact === codeLength;
}

export function emptyCurrentPegs(codeLength: number): (PegColor | null)[] {
  return Array.from({ length: codeLength }, () => null);
}

export function isGuessComplete(
  pegs: readonly (PegColor | null)[],
): pegs is PegColor[] {
  return pegs.length > 0 && pegs.every((p) => p !== null);
}
