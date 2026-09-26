import { describe, it, expect, beforeEach } from "vitest";
import {
  emptyGame,
  loadGame,
  loadStats,
  recordFinishedGame,
  saveGame,
  winPercent,
} from "./storage";
import { EMPTY_STATS } from "./types";

describe("storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns empty game when nothing saved", () => {
    expect(loadGame("2026-09-26")).toEqual(emptyGame("2026-09-26"));
  });

  it("persists and reloads the same-day game", () => {
    saveGame({
      dateKey: "2026-09-26",
      guesses: ["crane"],
      status: "playing",
      currentGuess: "ab",
    });
    expect(loadGame("2026-09-26")).toEqual({
      dateKey: "2026-09-26",
      guesses: ["crane"],
      status: "playing",
      currentGuess: "ab",
    });
  });

  it("resets when the calendar day changes", () => {
    saveGame({
      dateKey: "2026-09-25",
      guesses: ["crane"],
      status: "won",
      currentGuess: "",
    });
    expect(loadGame("2026-09-26").guesses).toEqual([]);
  });

  it("records a win once and updates streak stats", () => {
    const first = recordFinishedGame(
      { ...EMPTY_STATS, guessDistribution: [0, 0, 0, 0, 0, 0] },
      "2026-09-26",
      "won",
      3,
    );
    expect(first.played).toBe(1);
    expect(first.wins).toBe(1);
    expect(first.guessDistribution[2]).toBe(1);
    expect(winPercent(first)).toBe(100);

    const again = recordFinishedGame(first, "2026-09-26", "won", 2);
    expect(again.played).toBe(1);
  });

  it("breaks streak on a loss", () => {
    const won = recordFinishedGame(
      { ...EMPTY_STATS, guessDistribution: [0, 0, 0, 0, 0, 0] },
      "2026-09-25",
      "won",
      2,
    );
    const lost = recordFinishedGame(won, "2026-09-26", "lost", 6);
    expect(lost.currentStreak).toBe(0);
    expect(loadStats().played).toBe(2);
  });
});
