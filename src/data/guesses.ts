// Public domain / community word list for Tonni Games Wordle.
// Sources: community-shared five-letter English word lists (not NYT proprietary assets).
import { WORDS as chunk0 } from "./guesses-chunk-0";
import { WORDS as chunk1 } from "./guesses-chunk-1";
import { WORDS as chunk2 } from "./guesses-chunk-2";
import { WORDS as chunk3 } from "./guesses-chunk-3";
import { WORDS as chunk4 } from "./guesses-chunk-4";
import { WORDS as chunk5 } from "./guesses-chunk-5";

export const GUESSES: readonly string[] = [
  ...chunk0,
  ...chunk1,
  ...chunk2,
  ...chunk3,
  ...chunk4,
  ...chunk5,
];
