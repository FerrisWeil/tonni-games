import { describe, it, expect } from "vitest";
import { buildShareText } from "./share";

describe("buildShareText", () => {
  it("builds emoji grid and plain summary for a win", () => {
    const share = buildShareText({
      puzzleNumber: 42,
      guesses: ["crane", "plant"],
      solution: "plant",
      won: true,
    });
    expect(share.clipboard).toContain("Tonni Games Wordle #42 2/6");
    expect(share.emojiGrid.split("\n")).toHaveLength(2);
    expect(share.emojiGrid).toMatch(/[🟩🟨⬛]/);
    expect(share.plainSummary).toContain("Tonni Wordle #42 — 2/6");
    expect(share.plainSummary).toMatch(/Row 1:/);
    expect(share.plainSummary).toMatch(/correct|present|absent/);
  });

  it("uses X/6 for a loss", () => {
    const share = buildShareText({
      puzzleNumber: 7,
      guesses: ["aaaaa", "bbbbb", "ccccc", "ddddd", "eeeee", "fffff"],
      solution: "zzzzz",
      won: false,
    });
    expect(share.clipboard).toContain("#7 X/6");
    expect(share.emojiGrid.split("\n")).toHaveLength(6);
  });
});
