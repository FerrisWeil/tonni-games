import { describe, expect, it } from "vitest";
import {
  evaluateGuess,
  generateSecret,
  isValidGuess,
  isWinningFeedback,
} from "./evaluate";

describe("evaluateGuess", () => {
  it("marks all exact when guess matches secret", () => {
    expect(evaluateGuess([0, 1, 2, 3], [0, 1, 2, 3])).toEqual({
      exact: 4,
      near: 0,
    });
  });

  it("marks all near when colors match but positions are wrong", () => {
    expect(evaluateGuess([1, 2, 3, 0], [0, 1, 2, 3])).toEqual({
      exact: 0,
      near: 4,
    });
  });

  it("mixes exact and near", () => {
    // secret: 0 1 2 3
    // guess:  0 3 1 4 → exact at 0; near for 3 and 1
    expect(evaluateGuess([0, 3, 1, 4], [0, 1, 2, 3])).toEqual({
      exact: 1,
      near: 2,
    });
  });

  it("handles duplicate colors without over-counting (classic)", () => {
    // secret has one 1; guess has two 1s in wrong spots → one near
    expect(evaluateGuess([1, 1, 0, 0], [2, 3, 1, 4])).toEqual({
      exact: 0,
      near: 1,
    });
  });

  it("handles duplicate exact matches first", () => {
    // secret: 1 1 2 3
    // guess:  1 0 1 4 → one exact at 0; one near for second 1
    expect(evaluateGuess([1, 0, 1, 4], [1, 1, 2, 3])).toEqual({
      exact: 1,
      near: 1,
    });
  });

  it("returns zero when nothing matches", () => {
    expect(evaluateGuess([0, 0, 0, 0], [1, 2, 3, 4])).toEqual({
      exact: 0,
      near: 0,
    });
  });

  it("works for length-5 hard codes", () => {
    expect(evaluateGuess([0, 1, 2, 3, 4], [0, 1, 2, 3, 4])).toEqual({
      exact: 5,
      near: 0,
    });
    expect(evaluateGuess([4, 3, 2, 1, 0], [0, 1, 2, 3, 4])).toEqual({
      exact: 1,
      near: 4,
    });
  });

  it("throws when lengths differ", () => {
    expect(() => evaluateGuess([0, 1], [0, 1, 2])).toThrow(/length/);
  });
});

describe("isWinningFeedback", () => {
  it("wins only when every peg is exact", () => {
    expect(isWinningFeedback({ exact: 4, near: 0 }, 4)).toBe(true);
    expect(isWinningFeedback({ exact: 3, near: 1 }, 4)).toBe(false);
  });
});

describe("isValidGuess", () => {
  it("requires a full row of in-range pegs", () => {
    expect(isValidGuess([0, 1, 2, 3], 4, 6, true)).toBe(true);
    expect(isValidGuess([0, 1, null, 3], 4, 6, true)).toBe(false);
    expect(isValidGuess([0, 1, 2, 9], 4, 6, true)).toBe(false);
  });

  it("rejects duplicates when allowDuplicates is false", () => {
    expect(isValidGuess([0, 1, 1, 2], 4, 4, false)).toBe(false);
    expect(isValidGuess([0, 1, 2, 3], 4, 4, false)).toBe(true);
  });
});

describe("generateSecret", () => {
  it("generates unique colors when duplicates are off", () => {
    const secret = generateSecret(4, 4, false, () => 0);
    expect(secret).toHaveLength(4);
    expect(new Set(secret).size).toBe(4);
  });

  it("may repeat colors when duplicates are on", () => {
    let i = 0;
    const secret = generateSecret(4, 6, true, () => {
      // Always pick color 0
      i += 1;
      return 0;
    });
    expect(secret).toEqual([0, 0, 0, 0]);
    expect(i).toBe(4);
  });
});
