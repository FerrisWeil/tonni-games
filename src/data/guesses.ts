/**
 * Allowed guesses = solutions ∪ public guess lists.
 * Assembled from chunked files currently on main (word-list repair may continue
 * on sibling branches — do not import missing modules). Compatible with PR #3.
 */
import { GUESSES_0 } from "./guesses-0";
import { GUESSES_1 } from "./guesses-1";
import { GUESSES_2 } from "./guesses-2";
import { GUESSES_3 } from "./guesses-3";
import { GUESSES_4 } from "./guesses-4";
import { GUESSES_5 } from "./guesses-5";
import { WORDS as CHUNK_0 } from "./guesses-chunk-0";
import { WORDS as CHUNK_1 } from "./guesses-chunk-1";
import { WORDS as CHUNK_5 } from "./guesses-chunk-5";
import { PART_0 as GUESSES_PART_0 } from "./guesses-part-0";
import { SOLUTIONS } from "./solutions";

export const GUESSES: readonly string[] = [
  ...new Set<string>([
    ...SOLUTIONS,
    ...GUESSES_0,
    ...GUESSES_1,
    ...GUESSES_2,
    ...GUESSES_3,
    ...GUESSES_4,
    ...GUESSES_5,
    ...CHUNK_0,
    ...CHUNK_1,
    ...CHUNK_5,
    ...GUESSES_PART_0,
  ]),
];
