/** Shared Connections puzzle model (NYT + Tonni packs). */

export type Difficulty = 0 | 1 | 2 | 3;

export const DIFFICULTY_LABELS = [
  "Straightforward",
  "Medium",
  "Tricky",
  "Obscure",
] as const;

export const DIFFICULTY_COLORS = [
  "yellow",
  "green",
  "blue",
  "purple",
] as const;

export type DifficultyColor = (typeof DIFFICULTY_COLORS)[number];

export type ConnectionGroup = {
  title: string;
  words: readonly [string, string, string, string];
  /** 0 = easiest (yellow) … 3 = hardest (purple). */
  difficulty: Difficulty;
};

export type ConnectionsPuzzle = {
  id: string;
  /** Display title / pack id. */
  title: string;
  /** Optional calendar date for daily / NYT puzzles. */
  dateKey?: string;
  source: "tonni" | "nyt";
  groups: readonly [
    ConnectionGroup,
    ConnectionGroup,
    ConnectionGroup,
    ConnectionGroup,
  ];
};

export type ConnectionsSource = "tonni" | "nyt";

export const MAX_MISTAKES = 4;
export const GROUP_SIZE = 4;
export const BOARD_SIZE = 16;

export type GuessOutcome =
  | { kind: "correct"; group: ConnectionGroup }
  | { kind: "incorrect"; oneAway: boolean };

export type ConnectionsGameStatus = "playing" | "won" | "lost";

export type ConnectionsPersistedState = {
  puzzleId: string;
  foundGroupIds: string[];
  mistakes: number;
  status: ConnectionsGameStatus;
  /** Ordered mistake history for share grid (each entry is difficulty colors or "x"). */
  mistakeRows: string[];
};
