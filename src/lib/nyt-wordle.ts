/**
 * Opt-in unofficial Wordle puzzle fetch (personal/family spike).
 * Default product path stays on the local Tonni schedule — see resolveWordleSource().
 *
 * Usage-rights risk accepted for this Project (ADR 0009). Do not dump solution
 * archives into the repo.
 */

export type WordleSource = "local" | "nyt";

export type NytWordlePuzzle = {
  solution: string;
  printDate: string;
  daysSinceLaunch: number;
  id: number;
};

export type NytWordleRaw = {
  solution?: unknown;
  print_date?: unknown;
  days_since_launch?: unknown;
  id?: unknown;
  editor?: unknown;
};

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const SOLUTION_RE = /^[a-z]{5}$/;

/** Normalize undocumented NYT `svc/wordle/v2` JSON (keys only; no archive dumps). */
export function parseNytWordleJson(raw: unknown): NytWordlePuzzle {
  if (!raw || typeof raw !== "object") {
    throw new Error("NYT Wordle response is not an object");
  }
  const data = raw as NytWordleRaw;
  const solution =
    typeof data.solution === "string" ? data.solution.trim().toLowerCase() : "";
  if (!SOLUTION_RE.test(solution)) {
    throw new Error("NYT Wordle response missing a 5-letter solution");
  }
  const printDate =
    typeof data.print_date === "string" ? data.print_date.trim() : "";
  if (!DATE_RE.test(printDate)) {
    throw new Error("NYT Wordle response missing print_date (YYYY-MM-DD)");
  }
  const daysSinceLaunch =
    typeof data.days_since_launch === "number" &&
    Number.isFinite(data.days_since_launch)
      ? data.days_since_launch
      : NaN;
  if (!Number.isFinite(daysSinceLaunch)) {
    throw new Error("NYT Wordle response missing days_since_launch");
  }
  const id =
    typeof data.id === "number" && Number.isFinite(data.id) ? data.id : NaN;
  if (!Number.isFinite(id)) {
    throw new Error("NYT Wordle response missing id");
  }
  return { solution, printDate, daysSinceLaunch, id };
}

/**
 * Resolve puzzle source for personal testing.
 * Precedence: `?source=` query → `VITE_WORDLE_SOURCE` env → `local`.
 */
export function resolveWordleSource(
  search = typeof window !== "undefined" ? window.location.search : "",
  envSource = import.meta.env.VITE_WORDLE_SOURCE as string | undefined,
): WordleSource {
  const params = new URLSearchParams(search);
  const fromQuery = params.get("source")?.trim().toLowerCase();
  if (fromQuery === "nyt") return "nyt";
  if (fromQuery === "local") return "local";
  const fromEnv = envSource?.trim().toLowerCase();
  if (fromEnv === "nyt") return "nyt";
  return "local";
}

/** Optional archive date via `?date=YYYY-MM-DD` when source=nyt. */
export function resolveArchiveDateKey(
  search = typeof window !== "undefined" ? window.location.search : "",
  fallbackDateKey: string,
): string {
  const params = new URLSearchParams(search);
  const date = params.get("date")?.trim() ?? "";
  return DATE_RE.test(date) ? date : fallbackDateKey;
}

/**
 * Same-origin proxy path (Vite dev proxy + Vercel serverless).
 * Avoids browser CORS — NYT does not send Access-Control-Allow-Origin for arbitrary origins.
 */
export function nytWordleProxyUrl(dateKey: string): string {
  if (!DATE_RE.test(dateKey)) {
    throw new Error(`Invalid date key: ${dateKey}`);
  }
  return `/api/wordle-nyt/${dateKey}`;
}

export async function fetchNytWordlePuzzle(
  dateKey: string,
  fetchImpl: typeof fetch = fetch,
): Promise<NytWordlePuzzle> {
  const url = nytWordleProxyUrl(dateKey);
  const res = await fetchImpl(url, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`NYT Wordle fetch failed (${res.status})`);
  }
  const json: unknown = await res.json();
  return parseNytWordleJson(json);
}
