import type { LetterState } from "./types";

const STATE_LABEL: Record<LetterState, string> = {
  empty: "empty",
  tbd: "filled",
  correct: "correct",
  present: "present",
  absent: "absent",
};

/** Human-readable tile/key state for screen readers (not color-only). */
export function letterStateLabel(state: LetterState): string {
  return STATE_LABEL[state];
}

export function tileAriaLabel(letter: string, state: LetterState): string {
  if (!letter) return "Empty tile";
  return `${letter.toUpperCase()}, ${letterStateLabel(state)}`;
}
