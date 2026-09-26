import { SOLUTIONS } from "@/data/solutions";
import { GUESSES } from "@/data/guesses";

/** Local calendar date key YYYY-MM-DD (same puzzle for all players that local day). */
export function getLocalDateKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Tonni Games Wordle epoch — day 0 maps to the first shuffled solution. */
const EPOCH = Date.UTC(2024, 0, 1);

function daysSinceEpoch(dateKey: string): number {
  const [y, m, d] = dateKey.split("-").map(Number);
  const utc = Date.UTC(y, m - 1, d);
  return Math.floor((utc - EPOCH) / 86_400_000);
}

/** Deterministic shuffle so solution order is not alphabetical. */
function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffledSolutions(): readonly string[] {
  const arr = [...SOLUTIONS];
  const rand = mulberry32(0x74_6f_6e_6e_69); // "tonni"-ish seed
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const DAILY_ORDER = shuffledSolutions();

const GUESS_SET = new Set<string>(GUESSES);

export function getSolutionForDate(dateKey: string): string {
  const day = daysSinceEpoch(dateKey);
  const index = ((day % DAILY_ORDER.length) + DAILY_ORDER.length) % DAILY_ORDER.length;
  return DAILY_ORDER[index];
}

export function isValidGuess(word: string): boolean {
  return GUESS_SET.has(word.toLowerCase());
}

export function getPuzzleNumber(dateKey: string): number {
  return daysSinceEpoch(dateKey) + 1;
}
