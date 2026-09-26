import { describe, it, expect } from "vitest";
import {
  applyResolvedTheme,
  cycleThemePreference,
  isThemePreference,
  loadThemePreference,
  resolveTheme,
  saveThemePreference,
  THEME_STORAGE_KEY,
  themeColorFor,
  themePreferenceLabel,
} from "./theme";

describe("theme", () => {
  it("validates preference values", () => {
    expect(isThemePreference("system")).toBe(true);
    expect(isThemePreference("light")).toBe(true);
    expect(isThemePreference("dark")).toBe(true);
    expect(isThemePreference("auto")).toBe(false);
    expect(isThemePreference(null)).toBe(false);
  });

  it("resolves system preference from OS dark flag", () => {
    expect(resolveTheme("system", true)).toBe("dark");
    expect(resolveTheme("system", false)).toBe("light");
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
  });

  it("cycles system → light → dark → system", () => {
    expect(cycleThemePreference("system")).toBe("light");
    expect(cycleThemePreference("light")).toBe("dark");
    expect(cycleThemePreference("dark")).toBe("system");
  });

  it("loads and saves preference via storage", () => {
    const store = new Map<string, string>();
    const storage = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => {
        store.set(k, v);
      },
    };

    expect(loadThemePreference(storage)).toBe("system");
    saveThemePreference("dark", storage);
    expect(store.get(THEME_STORAGE_KEY)).toBe("dark");
    expect(loadThemePreference(storage)).toBe("dark");

    store.set(THEME_STORAGE_KEY, "nope");
    expect(loadThemePreference(storage)).toBe("system");
  });

  it("labels preferences for the toggle", () => {
    expect(themePreferenceLabel("system")).toBe("Theme: system");
    expect(themePreferenceLabel("light")).toBe("Theme: light");
    expect(themePreferenceLabel("dark")).toBe("Theme: dark");
  });

  it("applies data-theme on a root element", () => {
    const attrs: Record<string, string> = {};
    const root = {
      setAttribute: (name: string, value: string) => {
        attrs[name] = value;
      },
      style: { colorScheme: "" },
    };
    const metaAttrs: Record<string, string> = {};
    const meta = {
      setAttribute: (name: string, value: string) => {
        metaAttrs[name] = value;
      },
    };

    applyResolvedTheme("dark", root, meta);
    expect(attrs["data-theme"]).toBe("dark");
    expect(root.style.colorScheme).toBe("dark");
    expect(metaAttrs.content).toBe(themeColorFor("dark"));

    applyResolvedTheme("light", root, meta);
    expect(attrs["data-theme"]).toBe("light");
    expect(root.style.colorScheme).toBe("light");
    expect(metaAttrs.content).toBe(themeColorFor("light"));
  });
});
