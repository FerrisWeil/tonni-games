import { describe, it, expect } from "vitest";
import {
  evaluateGuess,
  buildKeyboardStates,
  strongerState,
} from "./evaluate";

describe("evaluateGuess", () => {
  it("marks correct letters green", () => {
    const result = evaluateGuess("crane", "crane");
    expect(result.map((r) => r.state)).toEqual([
      "correct",
      "correct",
      "correct",
      "correct",
      "correct",
    ]);
  });

  it("handles double letters like official Wordle", () => {
    const result = evaluateGuess("abbey", "abbey");
    expect(result.every((r) => r.state === "correct")).toBe(true);
  });

  it("only marks as many yellows as remaining letters", () => {
    const result = evaluateGuess("speed", "abate");
    expect(result[2].state).toBe("present");
    expect(result[3].state).toBe("absent");
  });

  it("marks all absent when no overlap", () => {
    const result = evaluateGuess("zzzzz", "abcde");
    expect(result.every((r) => r.state === "absent")).toBe(true);
  });

  it("handles repeated guess letter with one solution hit", () => {
    // solution has one A; first A correct, second A absent
    const result = evaluateGuess("aabxx", "acdef");
    expect(result[0].state).toBe("correct");
    expect(result[1].state).toBe("absent");
  });

  it("colors keyboard with strongest state", () => {
    const map = buildKeyboardStates(["aaaaa"], "abcde");
    expect(map.a).toBe("correct");
  });

  it("promotes present over absent on keyboard merge", () => {
    expect(strongerState("absent", "present")).toBe("present");
    expect(strongerState("present", "correct")).toBe("correct");
  });
});
