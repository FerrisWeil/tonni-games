import { describe, it, expect } from "vitest";
import { letterStateLabel, tileAriaLabel } from "./letter-state";

describe("letter-state a11y labels", () => {
  it("labels empty tiles", () => {
    expect(tileAriaLabel("", "empty")).toBe("Empty tile");
  });

  it("includes letter and state", () => {
    expect(tileAriaLabel("p", "correct")).toBe("P, correct");
    expect(letterStateLabel("present")).toBe("present");
  });
});
