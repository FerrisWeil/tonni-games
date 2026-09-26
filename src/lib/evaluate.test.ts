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

  it("evaluates N-letter solutions", () => {
    const short = evaluateGuess("cat", "car");
    expect(short.map((r) => r.state)).toEqual([
      "correct",
      "correct",
      "absent",
    ]);

    const long = evaluateGuess("abcdefgh", "abcxefgh");
    expect(long).toHaveLength(8);
    expect(long[0].state).toBe("correct");
    expect(long[3].state).toBe("absent");
    expect(long[7].state).toBe("correct");
  });

  it("handles double letters on N-length boards", () => {
    const result = evaluateGuess("balloon", "balloon");
    expect(result.every((r) => r.state === "correct")).toBe(true);

    const partial = evaluateGuess("llxxxxx", "balloon");
    // First L can be present (positions 2–3 in balloon); second L also present.
    expect(partial.filter((r) => r.state === "present")).toHaveLength(2);
  });
});
