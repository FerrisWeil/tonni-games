import type { ConnectionsPuzzle } from "@/lib/connections/types";

/**
 * Original Tonni-authored puzzles (not NYT IP).
 * Pack registry — add more packs under `src/data/connections/` and register them
 * in `packs.ts`.
 */
export const TONNI_STARTER_PUZZLES: ConnectionsPuzzle[] = [
  {
    id: "tonni-starter-1",
    title: "Tonni Starter #1",
    source: "tonni",
    groups: [
      {
        title: "COFFEE ORDERS",
        difficulty: 0,
        words: ["LATTE", "MOCHA", "AMERICANO", "CORTADO"],
      },
      {
        title: "THINGS THAT SCROLL",
        difficulty: 1,
        words: ["FEED", "CREDITS", "PARCHMENT", "TICKER"],
      },
      {
        title: "___ BOARD",
        difficulty: 2,
        words: ["CLIP", "DASH", "SOUND", "CHEESE"],
      },
      {
        title: "HOMOPHONES OF CURRENCY",
        difficulty: 3,
        words: ["CENT", "WON", "YEN", "POUND"],
      },
    ],
  },
  {
    id: "tonni-starter-2",
    title: "Tonni Starter #2",
    source: "tonni",
    groups: [
      {
        title: "KITCHEN VERBS",
        difficulty: 0,
        words: ["CHOP", "STIR", "SAUTE", "SIMMER"],
      },
      {
        title: "DOG COMMANDS",
        difficulty: 1,
        words: ["SIT", "STAY", "HEEL", "SPEAK"],
      },
      {
        title: "UNITS OF TIME",
        difficulty: 2,
        words: ["BEAT", "TICK", "SPAN", "SPELL"],
      },
      {
        title: "WORDS BEFORE “STONE”",
        difficulty: 3,
        words: ["STEPPING", "CORNER", "ROSETTA", "CURB"],
      },
    ],
  },
  {
    id: "tonni-starter-3",
    title: "Tonni Starter #3",
    source: "tonni",
    groups: [
      {
        title: "RAIN GEAR",
        difficulty: 0,
        words: ["PONCHO", "GALOSHES", "UMBRELLA", "SLICKER"],
      },
      {
        title: "CARD SUITS",
        difficulty: 1,
        words: ["HEARTS", "CLUBS", "SPADES", "DIAMONDS"],
      },
      {
        title: "THINGS YOU BOOK",
        difficulty: 2,
        words: ["FLIGHT", "TABLE", "TICKET", "APPOINTMENT"],
      },
      {
        title: "___ PAPER",
        difficulty: 3,
        words: ["WAX", "GRAPH", "TERM", "SCRAP"],
      },
    ],
  },
];
