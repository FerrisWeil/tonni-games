import type { Difficulty, MastermindPersistedState } from "./types";
import { DIFFICULTIES } from "./types";

const PREFIX = "tonni-mastermind-v1:";

function storage(): Storage | null {
  if (typeof window === "undefined" || !window.localStorage) return null;
  return window.localStorage;
}

function isValidState(raw: unknown): raw is MastermindPersistedState {
  if (!raw || typeof raw !== "object") return false;
  const s = raw as MastermindPersistedState;
  if (!(s.difficulty in DIFFICULTIES)) return false;
  const cfg = DIFFICULTIES[s.difficulty as Difficulty];
  if (!Array.isArray(s.secret) || s.secret.length !== cfg.codeLength) {
    return false;
  }
  if (!Array.isArray(s.guesses) || !Array.isArray(s.currentPegs)) return false;
  if (s.currentPegs.length !== cfg.codeLength) return false;
  if (!["playing", "won", "lost"].includes(s.status)) return false;
  return true;
}

export function loadMastermindState(
  difficulty: Difficulty,
): MastermindPersistedState | null {
  const store = storage();
  if (!store) return null;
  try {
    const raw = store.getItem(PREFIX + difficulty);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!isValidState(parsed)) return null;
    if (parsed.difficulty !== difficulty) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveMastermindState(state: MastermindPersistedState): void {
  const store = storage();
  if (!store) return;
  try {
    store.setItem(PREFIX + state.difficulty, JSON.stringify(state));
  } catch {
    // ignore quota / private mode
  }
}

export function clearMastermindState(difficulty: Difficulty): void {
  const store = storage();
  if (!store) return;
  try {
    store.removeItem(PREFIX + difficulty);
  } catch {
    // ignore
  }
}
