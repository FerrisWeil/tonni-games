// Public domain / community word list for Tonni Games Wordle.
// Assembled from available chunks on main (full list repair is a separate track).
import { WORDS as chunk0 } from "./guesses-chunk-0";
import { WORDS as chunk1 } from "./guesses-chunk-1";
import { SOLUTIONS } from "./solutions";

export const GUESSES: readonly string[] = [
  ...new Set<string>([...SOLUTIONS, ...chunk0, ...chunk1]),
];
