import {
  APP_SHELL_BODY_CLASS,
  APP_SHELL_CLASS,
  APP_SHELL_FOOTER_CLASS,
  APP_SHELL_HEADER_CLASS,
  APP_SHELL_LOCK,
} from "@/components/app-shell";
import {
  THEME_ROW_BASE,
  THEME_SELECT_INDICATOR_SLOT,
  themeRowSelectedClass,
  themeSelectIndicatorClass,
} from "@/lib/theme-ui";
import { describe, expect, it } from "vitest";

describe("AppShell layout contract (ADR 0021)", () => {
  it("locks document scroll and keeps chrome non-scrolling", () => {
    expect(APP_SHELL_LOCK).toBe("app-shell-lock");
    expect(APP_SHELL_CLASS).toContain("h-dvh");
    expect(APP_SHELL_CLASS).toContain("overflow-hidden");
    expect(APP_SHELL_HEADER_CLASS).toContain("shrink-0");
    expect(APP_SHELL_FOOTER_CLASS).toContain("shrink-0");
  });

  it("scrolls only the body pane", () => {
    expect(APP_SHELL_BODY_CLASS).toContain("overflow-y-auto");
    expect(APP_SHELL_BODY_CLASS).toContain("min-h-0");
    expect(APP_SHELL_BODY_CLASS).toContain("overscroll-y-contain");
    expect(APP_SHELL_HEADER_CLASS).not.toContain("overflow-y-auto");
  });
});

describe("Themes selection geometry (ADR 0022)", () => {
  it("reserves the same indicator slot when unselected", () => {
    const on = themeSelectIndicatorClass(true);
    const off = themeSelectIndicatorClass(false);
    expect(on).toContain(THEME_SELECT_INDICATOR_SLOT.split(" ")[0]);
    expect(off).toContain("invisible");
    expect(off).toContain("h-8");
    expect(off).toContain("w-8");
    expect(off).toContain("shrink-0");
    expect(on).toContain("h-8");
    expect(on).toContain("w-8");
    // Selection must not swap in a different size token
    expect(on.includes("h-8") && off.includes("h-8")).toBe(true);
  });

  it("keeps row base classes stable; selection only changes paint tokens", () => {
    expect(THEME_ROW_BASE).toContain("theme-row");
    const selected = themeRowSelectedClass(true);
    const idle = themeRowSelectedClass(false);
    expect(selected).toContain("border-[var(--accent-brand)]");
    expect(idle).toContain("border-[var(--panel-border)]");
    // No padding / size utilities that would reflow on select
    for (const cls of [selected, idle]) {
      expect(cls).not.toMatch(/\bp-\d/);
      expect(cls).not.toMatch(/\bmin-h-/);
      expect(cls).not.toMatch(/\bh-\d/);
    }
  });
});
