// Public domain / community word list for Tonni Games Wordle.
// Sources: community-shared five-letter English word lists (not NYT proprietary assets).
import { PART_0 } from './solutions-part-0';
import { PART_1 } from './solutions-part-1';
import { PART_2 } from './solutions-part-2';
import { PART_3 } from './solutions-part-3';
import { PART_4 } from './solutions-part-4';
import { PART_5 } from './solutions-part-5';

export const SOLUTIONS = [
  ...PART_0, ...PART_1, ...PART_2, ...PART_3, ...PART_4, ...PART_5,
] as const;
