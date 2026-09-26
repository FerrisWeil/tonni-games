import { describe, it, expect } from "vitest";
import {
  getLocalDateKey,
  getPuzzleNumber,
  getSolutionForDate,
  isValidGuess,
} from "./daily";
import { SOLUTIONS } from "@/data/solutions";

describe("daily puzzle", () => {
  it("formats local date as YYYY-MM-DD", () => {
    expect(getLocalDateKey(new Date(2026, 8, 26))).toBe("2026-09-26");
  });

  it("returns a 5-letter solution for a date", () => {
    const word = getSolutionForDate("2026-09-26");
    expect(word).toMatch(/^[a-z]{5}$/);
    expect(SOLUTIONS).toContain(word);
  });

  it("is stable for the same date", () => {
    expect(getSolutionForDate("2024-01-01")).toBe(
      getSolutionForDate("2024-01-01"),
    );
  });

  it("accepts solutions as valid guesses", () => {
    const word = getSolutionForDate("2026-09-26");
    expect(isValidGuess(word)).toBe(true);
  });

  it("rejects nonsense guesses", () => {
    expect(isValidGuess("zzzzz")).toBe(false);
    expect(isValidGuess("hi")).toBe(false);
  });

  it("assigns a positive puzzle number", () => {
    expect(getPuzzleNumber("2024-01-01")).toBe(1);
    expect(getPuzzleNumber("2024-01-02")).toBe(2);
  });
});
