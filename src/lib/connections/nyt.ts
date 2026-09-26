/**
 * Opt-in unofficial Connections puzzle fetch (personal/family).
 * Default product path is Tonni custom packs — see resolveConnectionsSource().
 *
 * Usage-rights risk accepted for this Project (ADR 0009 / 0013). Do not dump
 * NYT archives into the repo.
 */

import type { ConnectionsPuzzle, Difficulty } from "./types";
import { validatePuzzleShape } from "./logic";

export type ConnectionsSource = "tonni" | "nyt";

export type NytConnectionsRaw = {
  status?: unknown;
  id?: unknown;
  print_date?: unknown;
  editor?: unknown;
  categories?: unknown;
};

type NytCard = { content?: unknown; position?: unknown };
type NytCategory = { title?: unknown; cards?: unknown };

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Normalize undocumented NYT `svc/connections/v2` JSON. Categories are difficulty-ordered. */
export function parseNytConnectionsJson(raw: unknown): ConnectionsPuzzle {
  if (!raw || typeof raw !== "object") {
    throw new Error("NYT Connections response is not an object");
  }
  const data = raw as NytConnectionsRaw;
  const printDate =
    typeof data.print_date === "string" ? data.print_date.trim() : "";
  if (!DATE_RE.test(printDate)) {
    throw new Error("NYT Connections response missing print_date");
  }
  const idNum =
    typeof data.id === "number" && Number.isFinite(data.id) ? data.id : NaN;
  if (!Number.isFinite(idNum)) {
    throw new Error("NYT Connections response missing id");
  }
  if (!Array.isArray(data.categories) || data.categories.length !== 4) {
    throw new Error("NYT Connections response must have 4 categories");
  }

  const groups = data.categories.map((catUnknown, index) => {
    const cat = catUnknown as NytCategory;
    const title = typeof cat.title === "string" ? cat.title.trim() : "";
    if (!title) throw new Error(`Category ${index} missing title`);
    if (!Array.isArray(cat.cards) || cat.cards.length !== 4) {
      throw new Error(`Category "${title}" must have 4 cards`);
    }
    const words = cat.cards.map((cardUnknown) => {
      const card = cardUnknown as NytCard;
      const content =
        typeof card.content === "string" ? card.content.trim().toUpperCase() : "";
      if (!content) throw new Error(`Empty card in category "${title}"`);
      return content;
    }) as [string, string, string, string];
    return {
      title,
      words,
      difficulty: index as Difficulty,
    };
  });

  if (groups.length !== 4) {
    throw new Error("NYT Connections response must have 4 categories");
  }

  const puzzle: ConnectionsPuzzle = {
    id: `nyt-${idNum}-${printDate}`,
    title: `Connections #${idNum}`,
    dateKey: printDate,
    source: "nyt",
    groups: [groups[0]!, groups[1]!, groups[2]!, groups[3]!],
  };

  const errors = validatePuzzleShape(puzzle);
  if (errors.length > 0) {
    throw new Error(`Invalid NYT puzzle: ${errors.join("; ")}`);
  }
  return puzzle;
}

/**
 * Resolve puzzle source.
 * Precedence: `?source=` query → `VITE_CONNECTIONS_SOURCE` env → `tonni`.
 */
export function resolveConnectionsSource(
  search = typeof window !== "undefined" ? window.location.search : "",
  envSource = import.meta.env.VITE_CONNECTIONS_SOURCE as string | undefined,
): ConnectionsSource {
  const params = new URLSearchParams(search);
  const fromQuery = params.get("source")?.trim().toLowerCase();
  if (fromQuery === "nyt") return "nyt";
  if (fromQuery === "tonni" || fromQuery === "local" || fromQuery === "custom") {
    return "tonni";
  }
  const fromEnv = envSource?.trim().toLowerCase();
  if (fromEnv === "nyt") return "nyt";
  return "tonni";
}

/** Optional archive date via `?date=YYYY-MM-DD` when source=nyt. */
export function resolveConnectionsDateKey(
  search = typeof window !== "undefined" ? window.location.search : "",
  fallbackDateKey: string,
): string {
  const params = new URLSearchParams(search);
  const date = params.get("date")?.trim() ?? "";
  return DATE_RE.test(date) ? date : fallbackDateKey;
}

/** Optional Tonni puzzle id via `?puzzle=tonni-starter-1`. */
export function resolveTonniPuzzleId(
  search = typeof window !== "undefined" ? window.location.search : "",
): string | null {
  const params = new URLSearchParams(search);
  const id = params.get("puzzle")?.trim() ?? "";
  return id || null;
}

export function nytConnectionsProxyUrl(dateKey: string): string {
  if (!DATE_RE.test(dateKey)) {
    throw new Error(`Invalid date key: ${dateKey}`);
  }
  return `/api/connections-nyt/${dateKey}`;
}

export async function fetchNytConnectionsPuzzle(
  dateKey: string,
  fetchImpl: typeof fetch = fetch,
): Promise<ConnectionsPuzzle> {
  const url = nytConnectionsProxyUrl(dateKey);
  const res = await fetchImpl(url, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`NYT Connections fetch failed (${res.status})`);
  }
  const json: unknown = await res.json();
  return parseNytConnectionsJson(json);
}
