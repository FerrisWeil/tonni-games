import { describe, it, expect } from "vitest";
import { evaluateGuess, buildKeyboardStates } from "./evaluate";

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

  it("colors keyboard with strongest state", () => {
    const map = buildKeyboardStates(["aaaaa"], "abcde");
    expect(map.a).toBe("correct");
  });
});
