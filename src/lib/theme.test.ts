import { describe, it, expect } from "vitest";
import {
  applyResolvedTheme,
  cycleThemeSelection,
  isThemeSelection,
  loadThemeSelection,
  resolveThemeSelection,
  saveThemeSelection,
  THEME_STORAGE_KEY,
  LEGACY_THEME_STORAGE_KEY,
  themeSelectionLabel,
} from "./theme";
import {
  BUILTIN_THEMES,
  clearRegisteredThemes,
  getThemeById,
  listThemes,
  registerTheme,
  TOKEN_CSS_VARS,
} from "@/themes/registry";

describe("theme registry", () => {
  it("ships Classic, Midnight, High Contrast, and Meadow", () => {
    const ids = BUILTIN_THEMES.map((t) => t.id);
    expect(ids).toEqual(["classic", "midnight", "high-contrast", "meadow"]);
  });

  it("looks up themes by id", () => {
    expect(getThemeById("classic")?.name).toBe("Classic");
    expect(getThemeById("nope")).toBeUndefined();
  });

  it("allows registering a custom theme without colliding", () => {
    clearRegisteredThemes();
    const before = listThemes().length;
    registerTheme({
      id: "test-custom",
      name: "Test Custom",
      description: "Unit-test only",
      colorScheme: "light",
      tokens: getThemeById("classic")!.tokens,
      preview: { background: "#fff", accent: "#000", tile: "#0f0" },
    });
    expect(listThemes()).toHaveLength(before + 1);
    expect(getThemeById("test-custom")?.name).toBe("Test Custom");
    expect(() =>
      registerTheme({
        id: "test-custom",
        name: "Dup",
        description: "",
        colorScheme: "light",
        tokens: getThemeById("classic")!.tokens,
        preview: { background: "#fff", accent: "#000", tile: "#0f0" },
      }),
    ).toThrow(/already registered/);
    clearRegisteredThemes();
  });
});

describe("theme selection", () => {
  it("validates selection values", () => {
    expect(isThemeSelection("system")).toBe(true);
    expect(isThemeSelection("classic")).toBe(true);
    expect(isThemeSelection("midnight")).toBe(true);
    expect(isThemeSelection("light")).toBe(false);
    expect(isThemeSelection(null)).toBe(false);
  });

  it("resolves system to Classic or Midnight from OS", () => {
    expect(resolveThemeSelection("system", false).id).toBe("classic");
    expect(resolveThemeSelection("system", true).id).toBe("midnight");
    expect(resolveThemeSelection("high-contrast", true).id).toBe(
      "high-contrast",
    );
    expect(resolveThemeSelection("meadow", false).colorScheme).toBe("light");
  });

  it("cycles system → classic → midnight → high-contrast → meadow → system", () => {
    expect(cycleThemeSelection("system")).toBe("classic");
    expect(cycleThemeSelection("classic")).toBe("midnight");
    expect(cycleThemeSelection("midnight")).toBe("high-contrast");
    expect(cycleThemeSelection("high-contrast")).toBe("meadow");
    expect(cycleThemeSelection("meadow")).toBe("system");
  });

  it("loads v2 and migrates legacy v1 light/dark/system", () => {
    const store = new Map<string, string>();
    const storage = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => {
        store.set(k, v);
      },
    };

    expect(loadThemeSelection(storage)).toBe("system");

    saveThemeSelection("meadow", storage);
    expect(store.get(THEME_STORAGE_KEY)).toBe("meadow");
    expect(loadThemeSelection(storage)).toBe("meadow");

    store.clear();
    store.set(LEGACY_THEME_STORAGE_KEY, "dark");
    expect(loadThemeSelection(storage)).toBe("midnight");
    store.set(LEGACY_THEME_STORAGE_KEY, "light");
    expect(loadThemeSelection(storage)).toBe("classic");
    store.set(LEGACY_THEME_STORAGE_KEY, "system");
    expect(loadThemeSelection(storage)).toBe("system");
  });

  it("labels selections", () => {
    const midnight = resolveThemeSelection("midnight", false);
    expect(themeSelectionLabel("midnight")).toBe("Theme: Midnight");
    expect(themeSelectionLabel("system", midnight)).toBe(
      "Theme: system (Midnight)",
    );
  });

  it("applies data-theme, color-scheme, and CSS token vars", () => {
    const attrs: Record<string, string> = {};
    const props: Record<string, string> = {};
    const root = {
      setAttribute: (name: string, value: string) => {
        attrs[name] = value;
      },
      style: {
        colorScheme: "",
        setProperty: (name: string, value: string) => {
          props[name] = value;
        },
      },
    };
    const metaAttrs: Record<string, string> = {};
    const meta = {
      setAttribute: (name: string, value: string) => {
        metaAttrs[name] = value;
      },
    };

    const resolved = resolveThemeSelection("midnight", false);
    applyResolvedTheme(resolved, root, meta);

    expect(attrs["data-theme"]).toBe("midnight");
    expect(attrs["data-color-scheme"]).toBe("dark");
    expect(root.style.colorScheme).toBe("dark");
    expect(props[TOKEN_CSS_VARS.background]).toBe(
      resolved.definition.tokens.background,
    );
    expect(props[TOKEN_CSS_VARS.accentBrand]).toBe(
      resolved.definition.tokens.accentBrand,
    );
    expect(metaAttrs.content).toBe(resolved.definition.tokens.themeColor);
  });
});
