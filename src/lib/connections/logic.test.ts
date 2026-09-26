import { describe, expect, it } from "vitest";
import {
  bestOverlap,
  evaluateGuess,
  findMatchingGroup,
  groupKey,
  normalizeWord,
  remainingWords,
  shuffleWords,
  validatePuzzleShape,
} from "./logic";
import { assertPacksValid, getDefaultTonniPuzzle } from "./packs";
import { parseNytConnectionsJson, resolveConnectionsSource } from "./nyt";
import { buildConnectionsShare } from "./share";
import type { ConnectionsPuzzle } from "./types";

const sample: ConnectionsPuzzle = {
  id: "test-1",
  title: "Test",
  source: "tonni",
  groups: [
    {
      title: "A",
      difficulty: 0,
      words: ["ONE", "TWO", "THREE", "FOUR"],
    },
    {
      title: "B",
      difficulty: 1,
      words: ["FIVE", "SIX", "SEVEN", "EIGHT"],
    },
    {
      title: "C",
      difficulty: 2,
      words: ["NINE", "TEN", "ELEVEN", "TWELVE"],
    },
    {
      title: "D",
      difficulty: 3,
      words: ["THIRTEEN", "FOURTEEN", "FIFTEEN", "SIXTEEN"],
    },
  ],
};

describe("validatePuzzleShape", () => {
  it("accepts a valid 16-word puzzle", () => {
    expect(validatePuzzleShape(sample)).toEqual([]);
  });

  it("rejects duplicates", () => {
    const bad: ConnectionsPuzzle = {
      ...sample,
      groups: [
        sample.groups[0],
        sample.groups[1],
        sample.groups[2],
        {
          title: "D",
          difficulty: 3,
          words: ["ONE", "FOURTEEN", "FIFTEEN", "SIXTEEN"],
        },
      ],
    };
    expect(validatePuzzleShape(bad).some((e) => e.includes("Duplicate"))).toBe(
      true,
    );
  });
});

describe("Tonni packs", () => {
  it("ships valid starter puzzles", () => {
    expect(() => assertPacksValid()).not.toThrow();
    expect(getDefaultTonniPuzzle().groups).toHaveLength(4);
  });
});

describe("evaluateGuess", () => {
  it("matches a correct group regardless of order", () => {
    const found = new Set<string>();
    const outcome = evaluateGuess(
      sample,
      ["four", "ONE", "three", "two"],
      found,
    );
    expect(outcome.kind).toBe("correct");
    if (outcome.kind === "correct") {
      expect(outcome.group.title).toBe("A");
    }
  });

  it("detects one-away", () => {
    const found = new Set<string>();
    const outcome = evaluateGuess(
      sample,
      ["ONE", "TWO", "THREE", "FIVE"],
      found,
    );
    expect(outcome).toEqual({ kind: "incorrect", oneAway: true });
  });

  it("ignores already-found groups", () => {
    const found = new Set([groupKey(sample.groups[0])]);
    expect(
      findMatchingGroup(sample, ["ONE", "TWO", "THREE", "FOUR"], found),
    ).toBeNull();
    expect(bestOverlap(sample, ["ONE", "TWO", "THREE", "FOUR"], found)).toBe(0);
  });
});

describe("board helpers", () => {
  it("normalizes and shuffles without losing words", () => {
    expect(normalizeWord("  ab ")).toBe("AB");
    const words = remainingWords(sample, new Set());
    expect(words).toHaveLength(16);
    const shuffled = shuffleWords(words, () => 0.1);
    expect(shuffled).toHaveLength(16);
    expect(new Set(shuffled).size).toBe(16);
  });
});

describe("resolveConnectionsSource", () => {
  it("defaults to tonni; honors query and env", () => {
    expect(resolveConnectionsSource("", undefined)).toBe("tonni");
    expect(resolveConnectionsSource("?source=nyt", undefined)).toBe("nyt");
    expect(resolveConnectionsSource("?source=local", undefined)).toBe("tonni");
    expect(resolveConnectionsSource("", "nyt")).toBe("nyt");
    expect(resolveConnectionsSource("?source=tonni", "nyt")).toBe("tonni");
  });
});

describe("parseNytConnectionsJson", () => {
  it("parses difficulty-ordered categories", () => {
    const puzzle = parseNytConnectionsJson({
      status: "OK",
      id: 1,
      print_date: "2024-06-01",
      categories: [
        {
          title: "YELLOW",
          cards: [
            { content: "A", position: 0 },
            { content: "B", position: 1 },
            { content: "C", position: 2 },
            { content: "D", position: 3 },
          ],
        },
        {
          title: "GREEN",
          cards: [
            { content: "E", position: 4 },
            { content: "F", position: 5 },
            { content: "G", position: 6 },
            { content: "H", position: 7 },
          ],
        },
        {
          title: "BLUE",
          cards: [
            { content: "I", position: 8 },
            { content: "J", position: 9 },
            { content: "K", position: 10 },
            { content: "L", position: 11 },
          ],
        },
        {
          title: "PURPLE",
          cards: [
            { content: "M", position: 12 },
            { content: "N", position: 13 },
            { content: "O", position: 14 },
            { content: "P", position: 15 },
          ],
        },
      ],
    });
    expect(puzzle.source).toBe("nyt");
    expect(puzzle.groups[0].difficulty).toBe(0);
    expect(puzzle.groups[3].title).toBe("PURPLE");
    expect(puzzle.groups[3].words).toEqual(["M", "N", "O", "P"]);
  });
});

describe("buildConnectionsShare", () => {
  it("builds emoji grid and plain summary", () => {
    const share = buildConnectionsShare({
      puzzle: sample,
      foundGroups: [sample.groups[0], sample.groups[1]],
      mistakes: 2,
      won: false,
    });
    expect(share.emojiGrid).toContain("🟨🟨🟨🟨");
    expect(share.emojiGrid).toContain("🟩🟩🟩🟩");
    expect(share.emojiGrid).toContain("⬛⬛⬛⬛");
    expect(share.plainSummary).toMatch(/lost/i);
    expect(share.clipboard).toContain("Tonni Connections");
  });
});
