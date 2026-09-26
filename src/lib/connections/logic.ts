import type {
  ConnectionGroup,
  ConnectionsPuzzle,
  Difficulty,
  GuessOutcome,
} from "./types";
import { GROUP_SIZE } from "./types";

/** Stable id for a solved group within a puzzle (title + difficulty). */
export function groupKey(group: ConnectionGroup): string {
  return `${group.difficulty}:${group.title}`;
}

export function allWords(puzzle: ConnectionsPuzzle): string[] {
  return puzzle.groups.flatMap((g) => [...g.words]);
}

export function normalizeWord(word: string): string {
  return word.trim().toUpperCase();
}

export function validatePuzzleShape(puzzle: ConnectionsPuzzle): string[] {
  const errors: string[] = [];
  if (puzzle.groups.length !== 4) {
    errors.push("Puzzle must have exactly 4 groups");
  }
  const seen = new Set<string>();
  const difficulties = new Set<number>();
  for (const group of puzzle.groups) {
    if (group.words.length !== GROUP_SIZE) {
      errors.push(`Group "${group.title}" must have 4 words`);
    }
    if (group.difficulty < 0 || group.difficulty > 3) {
      errors.push(`Group "${group.title}" has invalid difficulty`);
    }
    difficulties.add(group.difficulty);
    for (const word of group.words) {
      const n = normalizeWord(word);
      if (!n) {
        errors.push(`Empty word in group "${group.title}"`);
        continue;
      }
      if (seen.has(n)) {
        errors.push(`Duplicate word: ${n}`);
      }
      seen.add(n);
    }
  }
  if (seen.size !== 16 && errors.length === 0) {
    errors.push(`Expected 16 unique words, got ${seen.size}`);
  }
  if (difficulties.size !== 4 && puzzle.groups.length === 4) {
    errors.push("Each group must have a distinct difficulty 0–3");
  }
  return errors;
}

export function findMatchingGroup(
  puzzle: ConnectionsPuzzle,
  selected: readonly string[],
  alreadyFound: ReadonlySet<string>,
): ConnectionGroup | null {
  if (selected.length !== GROUP_SIZE) return null;
  const selectedSet = new Set(selected.map(normalizeWord));
  for (const group of puzzle.groups) {
    const key = groupKey(group);
    if (alreadyFound.has(key)) continue;
    const words = group.words.map(normalizeWord);
    if (words.every((w) => selectedSet.has(w))) {
      return group;
    }
  }
  return null;
}

/** Count how many selected words belong to the closest unsolved group. */
export function bestOverlap(
  puzzle: ConnectionsPuzzle,
  selected: readonly string[],
  alreadyFound: ReadonlySet<string>,
): number {
  const selectedSet = new Set(selected.map(normalizeWord));
  let best = 0;
  for (const group of puzzle.groups) {
    if (alreadyFound.has(groupKey(group))) continue;
    let overlap = 0;
    for (const word of group.words) {
      if (selectedSet.has(normalizeWord(word))) overlap += 1;
    }
    if (overlap > best) best = overlap;
  }
  return best;
}

export function evaluateGuess(
  puzzle: ConnectionsPuzzle,
  selected: readonly string[],
  alreadyFound: ReadonlySet<string>,
): GuessOutcome {
  const match = findMatchingGroup(puzzle, selected, alreadyFound);
  if (match) {
    return { kind: "correct", group: match };
  }
  const overlap = bestOverlap(puzzle, selected, alreadyFound);
  return { kind: "incorrect", oneAway: overlap === GROUP_SIZE - 1 };
}

/** Fisher–Yates shuffle (mutates a copy). */
export function shuffleWords(
  words: readonly string[],
  random: () => number = Math.random,
): string[] {
  const arr = [...words];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function remainingWords(
  puzzle: ConnectionsPuzzle,
  foundKeys: ReadonlySet<string>,
): string[] {
  return puzzle.groups
    .filter((g) => !foundKeys.has(groupKey(g)))
    .flatMap((g) => [...g.words].map(normalizeWord));
}

export function groupsByDifficulty(
  puzzle: ConnectionsPuzzle,
): ConnectionGroup[] {
  return [...puzzle.groups].sort((a, b) => a.difficulty - b.difficulty);
}

export function difficultyOf(group: ConnectionGroup): Difficulty {
  return group.difficulty;
}
