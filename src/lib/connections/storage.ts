import type {
  ConnectionsGameStatus,
  ConnectionsPersistedState,
} from "./types";

const PREFIX = "tonni-connections-v1:";

function storage(): Storage | null {
  if (typeof window === "undefined" || !window.localStorage) return null;
  return window.localStorage;
}

export function loadConnectionsState(
  puzzleId: string,
): ConnectionsPersistedState | null {
  const s = storage();
  if (!s) return null;
  try {
    const raw = s.getItem(PREFIX + puzzleId);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConnectionsPersistedState;
    if (parsed.puzzleId !== puzzleId) return null;
    if (!Array.isArray(parsed.foundGroupIds)) return null;
    if (typeof parsed.mistakes !== "number") return null;
    if (!["playing", "won", "lost"].includes(parsed.status)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveConnectionsState(state: ConnectionsPersistedState): void {
  const s = storage();
  if (!s) return;
  try {
    s.setItem(PREFIX + state.puzzleId, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function clearConnectionsState(puzzleId: string): void {
  const s = storage();
  if (!s) return;
  try {
    s.removeItem(PREFIX + puzzleId);
  } catch {
    // ignore
  }
}

export type { ConnectionsGameStatus };
