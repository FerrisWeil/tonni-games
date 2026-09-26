export type LetterState = "correct" | "present" | "absent";

/** Accessible label for a tile/key — never color-only. */
export function letterStateLabel(
  letter: string,
  state?: LetterState | "empty" | "tbd",
): string {
  const L = letter.toUpperCase();
  if (!letter) return "Empty tile";
  switch (state) {
    case "correct":
      return `${L}, correct`;
    case "present":
      return `${L}, present in another position`;
    case "absent":
      return `${L}, absent`;
    case "tbd":
      return `${L}, pending`;
    default:
      return L;
  }
}
