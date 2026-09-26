export type LetterState = "correct" | "present" | "absent" | "empty" | "tbd";

export type GameStatus = "playing" | "won" | "lost";

export interface EvaluatedLetter {
  letter: string;
  state: LetterState;
}

export interface DailyGameState {
  dateKey: string;
  guesses: string[];
  status: GameStatus;
  currentGuess: string;
}

export interface Stats {
  played: number;
  wins: number;
  currentStreak: number;
  maxStreak: number;
  /** Index 0 = 1 guess, …, index 5 = 6 guesses */
  guessDistribution: [number, number, number, number, number, number];
  lastPlayedDate: string | null;
  lastWonDate: string | null;
}

export const EMPTY_STATS: Stats = {
  played: 0,
  wins: 0,
  currentStreak: 0,
  maxStreak: 0,
  guessDistribution: [0, 0, 0, 0, 0, 0],
  lastPlayedDate: null,
  lastWonDate: null,
};

export const WORD_LENGTH = 5;
export const MAX_GUESSES = 6;
