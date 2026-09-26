import type { DifficultyConfig, DifficultyId } from "./types";

/** Difficulty table — ADR 0028. */
export const DIFFICULTIES: Record<DifficultyId, DifficultyConfig> = {
  easy: {
    id: "easy",
    label: "Easy",
    description: "4 pegs · 4 colors · 12 guesses · no duplicates",
    codeLength: 4,
    colorCount: 4,
    maxGuesses: 12,
    allowDuplicates: false,
  },
  medium: {
    id: "medium",
    label: "Medium",
    description: "4 pegs · 6 colors · 10 guesses · duplicates on",
    codeLength: 4,
    colorCount: 6,
    maxGuesses: 10,
    allowDuplicates: true,
  },
  hard: {
    id: "hard",
    label: "Hard",
    description: "5 pegs · 8 colors · 8 guesses · duplicates on",
    codeLength: 5,
    colorCount: 8,
    maxGuesses: 8,
    allowDuplicates: true,
  },
};

export const DIFFICULTY_ORDER: DifficultyId[] = ["easy", "medium", "hard"];

/** Accessible color names for peg indices (up to Hard's 8). */
export const PEG_COLOR_NAMES = [
  "Coral",
  "Sky",
  "Moss",
  "Gold",
  "Violet",
  "Tangerine",
  "Teal",
  "Rose",
] as const;

export function getDifficulty(id: DifficultyId): DifficultyConfig {
  return DIFFICULTIES[id];
}
