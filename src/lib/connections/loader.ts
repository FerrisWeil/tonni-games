import { getLocalDateKey } from "@/lib/daily";
import {
  getDefaultTonniPuzzle,
  getTonniPuzzleById,
} from "./packs";
import {
  fetchNytConnectionsPuzzle,
  resolveConnectionsDateKey,
  resolveConnectionsSource,
  resolveTonniPuzzleId,
} from "./nyt";
import type { ConnectionsPuzzle, ConnectionsSource } from "./types";

export type LoadPuzzleResult = {
  puzzle: ConnectionsPuzzle;
  source: ConnectionsSource;
  /** True if NYT was requested but Tonni fallback was used. */
  fellBack: boolean;
  message?: string;
};

/**
 * Extensible puzzle loader (ADR 0013).
 * Tonni packs are local; NYT goes through same-origin proxy with soft fallback.
 */
export async function loadConnectionsPuzzle(opts?: {
  search?: string;
  envSource?: string;
  fetchImpl?: typeof fetch;
  todayKey?: string;
}): Promise<LoadPuzzleResult> {
  const search = opts?.search ?? (typeof window !== "undefined" ? window.location.search : "");
  const source = resolveConnectionsSource(search, opts?.envSource);
  const today = opts?.todayKey ?? getLocalDateKey();

  if (source === "tonni") {
    const id = resolveTonniPuzzleId(search);
    const puzzle = id ? getTonniPuzzleById(id) : getDefaultTonniPuzzle();
    if (!puzzle) {
      return {
        puzzle: getDefaultTonniPuzzle(),
        source: "tonni",
        fellBack: true,
        message: `Unknown puzzle “${id}” — showing default Tonni pack`,
      };
    }
    return { puzzle, source: "tonni", fellBack: false };
  }

  const dateKey = resolveConnectionsDateKey(search, today);
  try {
    const puzzle = await fetchNytConnectionsPuzzle(
      dateKey,
      opts?.fetchImpl ?? fetch,
    );
    return { puzzle, source: "nyt", fellBack: false };
  } catch {
    return {
      puzzle: getDefaultTonniPuzzle(),
      source: "tonni",
      fellBack: true,
      message: "NYT Connections unavailable — using Tonni puzzle",
    };
  }
}
