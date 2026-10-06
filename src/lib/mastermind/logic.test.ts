import { describe, expect, it } from "vitest";
import {
  emptyCurrentPegs,
  evaluateGuess,
  generateSecret,
  isGuessComplete,
  isWinningFeedback,
} from "./logic";
import { DIFFICULTIES, DIFFICULTY_ORDER } from "./types";

describe("DIFFICULTIES (ADR 0028)", () => {
  it("documents Easy / Medium / Hard parameters", () => {
    expect(DIFFICULTIES.easy).toMatchObject({
      codeLength: 4,
      colorCount: 4,
      maxGuesses: 12,
      allowDuplicates: false,
    });
    expect(DIFFICULTIES.medium).toMatchObject({
      codeLength: 4,
      colorCount: 6,
      maxGuesses: 10,
      allowDuplicates: true,
    });
    expect(DIFFICULTIES.hard).toMatchObject({
      codeLength: 5,
      colorCount: 8,
      maxGuesses: 8,
      allowDuplicates: true,
    });
    expect(DIFFICULTY_ORDER).toEqual(["easy", "medium", "hard"]);
  });
});

describe("generateSecret", () => {
  it("Easy produces unique colors of configured length", () => {
    const seq = [0.1, 0.9, 0.2, 0.8, 0.3, 0.7];
    let i = 0;
    const rng = () => seq[i++ % seq.length]!;
    const secret = generateSecret("easy", rng);
    expect(secret).toHaveLength(4);
    expect(new Set(secret).size).toBe(4);
    expect(secret.every((c) => c >= 0 && c < 4)).toBe(true);
  });

  it("Medium/Hard may include duplicates", () => {
    // Always pick color 0
    const secret = generateSecret("medium", () => 0);
    expect(secret).toEqual([0, 0, 0, 0]);
    const hard = generateSecret("hard", () => 0);
    expect(hard).toEqual([0, 0, 0, 0, 0]);
  });

  it("respects colorCount bounds", () => {
    let calls = 0;
    const rng = () => {
      // 0.999 → last color index
      calls += 1;
      return 0.999;
    };
    const secret = generateSecret("hard", rng);
    expect(secret.every((c) => c === 7)).toBe(true);
    expect(calls).toBe(5);
  });
});

describe("evaluateGuess", () => {
  it("marks all exact on perfect match", () => {
    expect(evaluateGuess([0, 1, 2, 3], [0, 1, 2, 3])).toEqual({
      exact: 4,
      near: 0,
    });
  });

  it("counts near when colors match wrong positions", () => {
    expect(evaluateGuess([1, 0, 3, 2], [0, 1, 2, 3])).toEqual({
      exact: 0,
      near: 4,
    });
  });

  it("mixes exact and near", () => {
    // secret R B G Y → guess R G B Y → exact R+Y, near G+B
    expect(evaluateGuess([0, 2, 1, 3], [0, 1, 2, 3])).toEqual({
      exact: 2,
      near: 2,
    });
  });

  it("handles duplicates: exact consumes before near", () => {
    // secret: two reds at 0 and 1. Guess: one red at wrong spot + one exact.
    // secret [0,0,1,2], guess [0,3,0,2]
    // exact: pos0 (0), pos3 (2) → exact 2
    // remaining secret: pos1=0; remaining guess: pos1=3, pos2=0 → near 1
    expect(evaluateGuess([0, 3, 0, 2], [0, 0, 1, 2])).toEqual({
      exact: 2,
      near: 1,
    });
  });

  it("does not over-count near when guess has extra duplicates", () => {
    // secret one red; guess three reds → at most one near/exact total
    expect(evaluateGuess([0, 0, 0, 1], [0, 2, 3, 4])).toEqual({
      exact: 1,
      near: 0,
    });
    expect(evaluateGuess([1, 0, 0, 0], [0, 2, 3, 4])).toEqual({
      exact: 0,
      near: 1,
    });
  });

  it("works for Hard length-5 codes", () => {
    expect(evaluateGuess([0, 1, 2, 3, 4], [0, 1, 2, 3, 4])).toEqual({
      exact: 5,
      near: 0,
    });
    expect(evaluateGuess([4, 3, 2, 1, 0], [0, 1, 2, 3, 4])).toEqual({
      exact: 1,
      near: 4,
    });
  });

  it("throws on length mismatch", () => {
    expect(() => evaluateGuess([0, 1], [0, 1, 2])).toThrow(/length/);
  });
});

describe("helpers", () => {
  it("isWinningFeedback requires all exact", () => {
    expect(isWinningFeedback({ exact: 4, near: 0 }, 4)).toBe(true);
    expect(isWinningFeedback({ exact: 3, near: 1 }, 4)).toBe(false);
  });

  it("emptyCurrentPegs and isGuessComplete", () => {
    const empty = emptyCurrentPegs(4);
    expect(empty).toEqual([null, null, null, null]);
    expect(isGuessComplete(empty)).toBe(false);
    expect(isGuessComplete([0, 1, 2, 3])).toBe(true);
    expect(isGuessComplete([0, 1, null, 3])).toBe(false);
  });
});
