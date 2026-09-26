import {
  EMPTY_STATS,
  type DailyGameState,
  type GameStatus,
  type Stats,
} from "./types";

const GAME_KEY = "tonni-wordle-game-v1";
const STATS_KEY = "tonni-wordle-stats-v1";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

export function loadGame(dateKey: string): DailyGameState {
  if (!canUseStorage()) {
    return emptyGame(dateKey);
  }
  try {
    const raw = localStorage.getItem(GAME_KEY);
    if (!raw) return emptyGame(dateKey);
    const parsed = JSON.parse(raw) as DailyGameState;
    if (parsed.dateKey !== dateKey) return emptyGame(dateKey);
    return {
      dateKey,
      guesses: Array.isArray(parsed.guesses) ? parsed.guesses : [],
      status: parsed.status ?? "playing",
      currentGuess: typeof parsed.currentGuess === "string" ? parsed.currentGuess : "",
    };
  } catch {
    return emptyGame(dateKey);
  }
}

export function saveGame(state: DailyGameState): void {
  if (!canUseStorage()) return;
  localStorage.setItem(GAME_KEY, JSON.stringify(state));
}

export function emptyGame(dateKey: string): DailyGameState {
  return {
    dateKey,
    guesses: [],
    status: "playing",
    currentGuess: "",
  };
}

export function loadStats(): Stats {
  if (!canUseStorage()) return { ...EMPTY_STATS, guessDistribution: [...EMPTY_STATS.guessDistribution] };
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return { ...EMPTY_STATS, guessDistribution: [0, 0, 0, 0, 0, 0] };
    const parsed = JSON.parse(raw) as Stats;
    return {
      played: parsed.played ?? 0,
      wins: parsed.wins ?? 0,
      currentStreak: parsed.currentStreak ?? 0,
      maxStreak: parsed.maxStreak ?? 0,
      guessDistribution: parsed.guessDistribution ?? [0, 0, 0, 0, 0, 0],
      lastPlayedDate: parsed.lastPlayedDate ?? null,
      lastWonDate: parsed.lastWonDate ?? null,
    };
  } catch {
    return { ...EMPTY_STATS, guessDistribution: [0, 0, 0, 0, 0, 0] };
  }
}

export function saveStats(stats: Stats): void {
  if (!canUseStorage()) return;
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

function previousDateKey(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() - 1);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

/** Record a finished game once (idempotent per date). */
export function recordFinishedGame(
  stats: Stats,
  dateKey: string,
  status: Exclude<GameStatus, "playing">,
  guessCount: number,
): Stats {
  if (stats.lastPlayedDate === dateKey) return stats;

  const next: Stats = {
    ...stats,
    guessDistribution: [...stats.guessDistribution] as Stats["guessDistribution"],
    played: stats.played + 1,
    lastPlayedDate: dateKey,
  };

  if (status === "won") {
    next.wins += 1;
    const continues =
      stats.lastWonDate === previousDateKey(dateKey) ||
      stats.lastWonDate === dateKey;
    next.currentStreak = continues ? stats.currentStreak + 1 : 1;
    next.maxStreak = Math.max(next.maxStreak, next.currentStreak);
    next.lastWonDate = dateKey;
    const idx = Math.min(Math.max(guessCount - 1, 0), 5);
    next.guessDistribution[idx] += 1;
  } else {
    next.currentStreak = 0;
  }

  saveStats(next);
  return next;
}

export function winPercent(stats: Stats): number {
  if (stats.played === 0) return 0;
  return Math.round((stats.wins / stats.played) * 100);
}
