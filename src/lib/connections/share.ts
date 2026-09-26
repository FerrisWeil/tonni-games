import type { ConnectionGroup, ConnectionsPuzzle } from "./types";
import { DIFFICULTY_COLORS } from "./types";
import { groupKey } from "./logic";

const EMOJI: Record<(typeof DIFFICULTY_COLORS)[number], string> = {
  yellow: "🟨",
  green: "🟩",
  blue: "🟦",
  purple: "🟪",
};

export type ConnectionsSharePayload = {
  emojiGrid: string;
  plainSummary: string;
  clipboard: string;
};

/**
 * Share-friendly result: one emoji per solved group (in solve order),
 * then mistake rows as gray blocks when lost mid-board is not needed —
 * we record solved difficulties in order + X for remaining mistakes vibe.
 */
export function buildConnectionsShare(opts: {
  puzzle: ConnectionsPuzzle;
  foundGroups: ConnectionGroup[];
  mistakes: number;
  won: boolean;
}): ConnectionsSharePayload {
  const label =
    opts.puzzle.source === "nyt"
      ? `Tonni Connections ${opts.puzzle.title}`
      : `Tonni Connections — ${opts.puzzle.title}`;
  const score = opts.won ? String(opts.mistakes) : "X";
  const title = `${label} ${score}/${4}`;

  const emojiRows = opts.foundGroups.map((g) => {
    const color = DIFFICULTY_COLORS[g.difficulty];
    return EMOJI[color].repeat(4);
  });
  // Pad with black rows for unsolved when lost
  if (!opts.won) {
    const remaining = 4 - opts.foundGroups.length;
    for (let i = 0; i < remaining; i++) {
      emojiRows.push("⬛⬛⬛⬛");
    }
  }
  const emojiGrid = emojiRows.join("\n");

  const plainParts = [
    `${label} — ${opts.won ? "solved" : "lost"} with ${opts.mistakes} mistake${opts.mistakes === 1 ? "" : "s"}.`,
    ...opts.foundGroups.map(
      (g, i) =>
        `Group ${i + 1}: ${DIFFICULTY_COLORS[g.difficulty]} — ${g.title}`,
    ),
  ];
  if (!opts.won) {
    const unsolved = opts.puzzle.groups.filter(
      (g) => !opts.foundGroups.some((f) => groupKey(f) === groupKey(g)),
    );
    for (const g of unsolved) {
      plainParts.push(`Unsolved: ${g.title}`);
    }
  }
  const plainSummary = plainParts.join(" ");
  const clipboard = [title, "", emojiGrid, "", plainSummary].join("\n");
  return { emojiGrid, plainSummary, clipboard };
}
