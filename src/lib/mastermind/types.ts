export type DifficultyId = "easy" | "medium" | "hard";

export type GameStatus = "playing" | "won" | "lost";

/** Peg color index within the difficulty's palette (0 … colorCount-1). */
export type PegId = number;

export type Feedback = {
  /** Right color, right position (classic black key). */
  exact: number;
  /** Right color, wrong position (classic white key). */
  near: number;
};

export type GuessRow = {
  pegs: PegId[];
  feedback: Feedback;
};

export type DifficultyConfig = {
  id: DifficultyId;
  label: string;
  description: string;
  codeLength: number;
  colorCount: number;
  maxGuesses: number;
  allowDuplicates: boolean;
};

export type MastermindGameState = {
  version: 1;
  difficulty: DifficultyId;
  secret: PegId[];
  guesses: GuessRow[];
  status: GameStatus;
};
