import type { DifficultyId, MastermindGameState } from "./types";
import { DIFFICULTIES } from "./difficulty";

const STORAGE_KEY = "tonni-mastermind-v1";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

function isPegArray(value: unknown, length: number, colorCount: number): value is number[] {
  return (
    Array.isArray(value) &&
    value.length === length &&
    value.every(
      (p) => typeof p === "number" && Number.isInteger(p) && p >= 0 && p < colorCount,
    )
  );
}

export function loadMastermindState(
  difficulty: DifficultyId,
): MastermindGameState | null {
  if (!canUseStorage()) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as MastermindGameState;
    if (parsed.version !== 1 || parsed.difficulty !== difficulty) return null;

    const cfg = DIFFICULTIES[difficulty];
    if (!isPegArray(parsed.secret, cfg.codeLength, cfg.colorCount)) return null;
    if (!Array.isArray(parsed.guesses)) return null;
    if (
      parsed.status !== "playing" &&
      parsed.status !== "won" &&
      parsed.status !== "lost"
    ) {
      return null;
    }

    for (const row of parsed.guesses) {
      if (
        !row ||
        !isPegArray(row.pegs, cfg.codeLength, cfg.colorCount) ||
        typeof row.feedback?.exact !== "number" ||
        typeof row.feedback?.near !== "number"
      ) {
        return null;
      }
    }

    return parsed;
  } catch {
    return null;
  }
}

export function saveMastermindState(state: MastermindGameState): void {
  if (!canUseStorage()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore quota / private-mode failures.
  }
}

export function clearMastermindState(): void {
  if (!canUseStorage()) return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
