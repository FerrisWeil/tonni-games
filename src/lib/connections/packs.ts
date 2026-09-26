import { TONNI_STARTER_PUZZLES } from "@/data/connections/tonni-starter";
import type { ConnectionsPuzzle } from "@/lib/connections/types";
import { validatePuzzleShape } from "@/lib/connections/logic";

/**
 * Extensible pack registry (ADR 0013).
 * Add packs by importing puzzle arrays and pushing into `CONNECTION_PACKS`.
 */
export type ConnectionPack = {
  id: string;
  label: string;
  puzzles: readonly ConnectionsPuzzle[];
};

export const CONNECTION_PACKS: readonly ConnectionPack[] = [
  {
    id: "tonni-starter",
    label: "Tonni Starter",
    puzzles: TONNI_STARTER_PUZZLES,
  },
];

export function listTonniPuzzles(): ConnectionsPuzzle[] {
  return CONNECTION_PACKS.flatMap((pack) => [...pack.puzzles]);
}

export function getTonniPuzzleById(id: string): ConnectionsPuzzle | null {
  return listTonniPuzzles().find((p) => p.id === id) ?? null;
}

/** Default Tonni puzzle — first valid pack entry. */
export function getDefaultTonniPuzzle(): ConnectionsPuzzle {
  const puzzles = listTonniPuzzles();
  for (const puzzle of puzzles) {
    const errors = validatePuzzleShape(puzzle);
    if (errors.length === 0) return puzzle;
  }
  throw new Error("No valid Tonni Connections puzzles registered");
}

export function assertPacksValid(): void {
  for (const pack of CONNECTION_PACKS) {
    for (const puzzle of pack.puzzles) {
      const errors = validatePuzzleShape(puzzle);
      if (errors.length > 0) {
        throw new Error(
          `Invalid puzzle ${puzzle.id} in pack ${pack.id}: ${errors.join("; ")}`,
        );
      }
    }
  }
}
