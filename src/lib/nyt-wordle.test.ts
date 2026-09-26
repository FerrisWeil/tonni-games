import { afterEach, describe, expect, it, vi } from "vitest";
import {
  fetchNytWordlePuzzle,
  nytWordleProxyUrl,
  parseNytWordleJson,
  resolveArchiveDateKey,
  resolveWordleSource,
} from "./nyt-wordle";

describe("parseNytWordleJson", () => {
  it("normalizes the undocumented NYT JSON shape", () => {
    const puzzle = parseNytWordleJson({
      id: 42,
      solution: "Crane",
      print_date: "2022-01-01",
      days_since_launch: 0,
      editor: "Someone",
    });
    expect(puzzle).toEqual({
      solution: "crane",
      printDate: "2022-01-01",
      daysSinceLaunch: 0,
      id: 42,
    });
  });

  it("rejects missing or invalid fields", () => {
    expect(() => parseNytWordleJson(null)).toThrow(/not an object/);
    expect(() =>
      parseNytWordleJson({
        id: 1,
        solution: "toolong",
        print_date: "2022-01-01",
        days_since_launch: 0,
      }),
    ).toThrow(/5-letter/);
    expect(() =>
      parseNytWordleJson({
        id: 1,
        solution: "crane",
        print_date: "01-01-2022",
        days_since_launch: 0,
      }),
    ).toThrow(/print_date/);
  });
});

describe("resolveWordleSource", () => {
  it("defaults to local", () => {
    expect(resolveWordleSource("", undefined)).toBe("local");
    expect(resolveWordleSource("?foo=1", "other")).toBe("local");
  });

  it("honors query over env", () => {
    expect(resolveWordleSource("?source=nyt", "local")).toBe("nyt");
    expect(resolveWordleSource("?source=local", "nyt")).toBe("local");
    expect(resolveWordleSource("", "nyt")).toBe("nyt");
    expect(resolveWordleSource("?source=NYT", undefined)).toBe("nyt");
  });
});

describe("resolveArchiveDateKey", () => {
  it("uses ?date= when valid", () => {
    expect(resolveArchiveDateKey("?date=2022-01-01", "2026-09-26")).toBe(
      "2022-01-01",
    );
    expect(resolveArchiveDateKey("?date=nope", "2026-09-26")).toBe(
      "2026-09-26",
    );
  });
});

describe("fetchNytWordlePuzzle", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("builds the same-origin proxy URL", () => {
    expect(nytWordleProxyUrl("2022-01-01")).toBe("/api/wordle-nyt/2022-01-01");
  });

  it("parses a successful mocked fetch", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        id: 7,
        solution: "apple",
        print_date: "2022-02-01",
        days_since_launch: 31,
      }),
    });
    const puzzle = await fetchNytWordlePuzzle("2022-02-01", fetchMock);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/wordle-nyt/2022-02-01",
      expect.objectContaining({ headers: { Accept: "application/json" } }),
    );
    expect(puzzle.solution).toBe("apple");
    expect(puzzle.printDate).toBe("2022-02-01");
  });

  it("throws on non-OK responses", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({}),
    });
    await expect(fetchNytWordlePuzzle("2022-01-01", fetchMock)).rejects.toThrow(
      /403/,
    );
  });
});
