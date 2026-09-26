export type LetterState = "empty" | "tbd" | "absent" | "present" | "correct";

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
