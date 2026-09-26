import { describe, it, expect } from "vitest";
import {
  BUILDER_MAX_LENGTH,
  BUILDER_MIN_LENGTH,
  decodeSolution,
  encodeSolution,
  maxGuessesForLength,
  normalizeSolutionInput,
} from "./wordle-builder";

describe("wordle-builder codec", () => {
  it("round-trips 5-letter words", () => {
    const enc = encodeSolution("crane");
    expect(enc.ok).toBe(true);
    if (!enc.ok) return;
    const dec = decodeSolution(enc.code);
    expect(dec).toEqual({
      ok: true,
      word: "crane",
      length: 5,
      version: 1,
    });
  });

  it("round-trips min and max lengths", () => {
    const short = "cat";
    const long = "a".repeat(BUILDER_MAX_LENGTH);
    expect(short.length).toBe(BUILDER_MIN_LENGTH);

    for (const word of [short, long]) {
      const enc = encodeSolution(word);
      expect(enc.ok).toBe(true);
      if (!enc.ok) return;
      const dec = decodeSolution(enc.code);
      expect(dec.ok && dec.word).toBe(word.toLowerCase());
    }
  });

  it("normalizes case and strips non-letters on encode input", () => {
    expect(normalizeSolutionInput("  ToNnI! ")).toBe("TONNI");
    const enc = encodeSolution("ToNnI");
    expect(enc.ok && enc.word).toBe("tonni");
  });

  it("rejects invalid lengths and charset", () => {
    expect(encodeSolution("").ok).toBe(false);
    expect(encodeSolution("ab").ok).toBe(false);
    expect(encodeSolution("a".repeat(BUILDER_MAX_LENGTH + 1)).ok).toBe(false);
  });

  it("produces URL-safe base64url without padding", () => {
    const enc = encodeSolution("family");
    expect(enc.ok).toBe(true);
    if (!enc.ok) return;
    expect(enc.code).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(enc.code.includes("=")).toBe(false);
    expect(enc.code.includes("+")).toBe(false);
    expect(enc.code.includes("/")).toBe(false);
  });

  it("obfuscates so the plaintext word is not visible in the code", () => {
    const enc = encodeSolution("SECRET");
    expect(enc.ok).toBe(true);
    if (!enc.ok) return;
    expect(enc.code.toLowerCase().includes("secret")).toBe(false);
  });

  it("detects tampered checksum", () => {
    const enc = encodeSolution("hello");
    expect(enc.ok).toBe(true);
    if (!enc.ok) return;
    const chars = enc.code.split("");
    chars[chars.length - 1] =
      chars[chars.length - 1] === "A" ? "B" : "A";
    const dec = decodeSolution(chars.join(""));
    expect(dec.ok).toBe(false);
  });

  it("scales guess budget by length", () => {
    expect(maxGuessesForLength(3)).toBe(6);
    expect(maxGuessesForLength(5)).toBe(6);
    expect(maxGuessesForLength(6)).toBe(7);
    expect(maxGuessesForLength(7)).toBe(7);
    expect(maxGuessesForLength(8)).toBe(8);
    expect(maxGuessesForLength(10)).toBe(8);
  });
});
