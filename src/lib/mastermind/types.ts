/** Mastermind difficulty + game types (ADR 0028). */

export type Difficulty = "easy" | "medium" | "hard";

export type MastermindStatus = "playing" | "won" | "lost";

export type DifficultyConfig = {
  id: Difficulty;
  label: string;
  /** Pegs in the secret / each guess. */
  codeLength: number;
  /** Number of distinct colors in the palette. */
  colorCount: number;
  maxGuesses: number;
  allowDuplicates: boolean;
  blurb: string;
};

/** Binding difficulty table from ADR 0028. */
export const DIFFICULTIES: Record<Difficulty, DifficultyConfig> = {
  easy: {
    id: "easy",
    label: "Easy",
    codeLength: 4,
    colorCount: 4,
    maxGuesses: 12,
    allowDuplicates: false,
    blurb: "4 pegs · 4 colors · no duplicates · 12 guesses",
  },
  medium: {
    id: "medium",
    label: "Medium",
    codeLength: 4,
    colorCount: 6,
    maxGuesses: 10,
    allowDuplicates: true,
    blurb: "4 pegs · 6 colors · duplicates on · 10 guesses",
  },
  hard: {
    id: "hard",
    label: "Hard",
    codeLength: 5,
    colorCount: 8,
    maxGuesses: 8,
    allowDuplicates: true,
    blurb: "5 pegs · 8 colors · duplicates on · 8 guesses",
  },
};

export const DIFFICULTY_ORDER: Difficulty[] = ["easy", "medium", "hard"];

/** Color index 0..colorCount-1; null = empty slot. */
export type PegColor = number;

export type Feedback = {
  /** Right color, right position. */
  exact: number;
  /** Right color, wrong position. */
  near: number;
};

export type GuessRow = {
  pegs: PegColor[];
  feedback: Feedback;
};

export type MastermindPersistedState = {
  difficulty: Difficulty;
  secret: PegColor[];
  guesses: GuessRow[];
  currentPegs: (PegColor | null)[];
  status: MastermindStatus;
};

/** Accessible names for peg indices (themes only recolor). */
export const PEG_LABELS = [
  "Red",
  "Blue",
  "Green",
  "Yellow",
  "Orange",
  "Magenta",
  "Teal",
  "Brown",
] as const;
