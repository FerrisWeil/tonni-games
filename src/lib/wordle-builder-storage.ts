import type { GameStatus } from "./types";

const CUSTOM_PREFIX = "tonni-wordle-custom:";

export interface CustomGameState {
  code: string;
  guesses: string[];
  status: GameStatus;
  currentGuess: string;
}

function storageKey(code: string): string {
  return `${CUSTOM_PREFIX}${code}`;
}

export function loadCustomGame(code: string): CustomGameState {
  const empty: CustomGameState = {
    code,
    guesses: [],
    status: "playing",
    currentGuess: "",
  };
  try {
    const raw = localStorage.getItem(storageKey(code));
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Partial<CustomGameState>;
    if (parsed.code !== code) return empty;
    return {
      code,
      guesses: Array.isArray(parsed.guesses) ? parsed.guesses : [],
      status:
        parsed.status === "won" || parsed.status === "lost"
          ? parsed.status
          : "playing",
      currentGuess:
        typeof parsed.currentGuess === "string" ? parsed.currentGuess : "",
    };
  } catch {
    return empty;
  }
}

export function saveCustomGame(state: CustomGameState): void {
  try {
    localStorage.setItem(storageKey(state.code), JSON.stringify(state));
  } catch {
    // quota / private mode — ignore
  }
}
