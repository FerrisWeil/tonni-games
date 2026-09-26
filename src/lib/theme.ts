/**
 * Theme preference resolve / persist / apply.
 * Extends ADR 0011 dark mode into ADR 0012 named themes.
 *
 * Selection values: "system" | built-in theme id (classic, midnight, …).
 * "system" resolves to Classic (light OS) or Midnight (dark OS).
 */

import {
  DEFAULT_DARK_THEME_ID,
  DEFAULT_LIGHT_THEME_ID,
  TOKEN_CSS_VARS,
  getThemeById,
  isThemeId,
  type ColorScheme,
  type ThemeDefinition,
  type ThemeTokens,
} from "@/themes/registry";

/** Persisted selection: follow OS, or a concrete theme id. */
export type ThemeSelection = "system" | string;

export type ResolvedTheme = {
  id: string;
  definition: ThemeDefinition;
  colorScheme: ColorScheme;
};

/** v2 stores named theme ids; v1 was system|light|dark. */
export const THEME_STORAGE_KEY = "tonni-theme-v2";
export const LEGACY_THEME_STORAGE_KEY = "tonni-theme-v1";

const LEGACY_MAP: Record<string, ThemeSelection> = {
  system: "system",
  light: DEFAULT_LIGHT_THEME_ID,
  dark: DEFAULT_DARK_THEME_ID,
};

export function isThemeSelection(value: unknown): value is ThemeSelection {
  return value === "system" || isThemeId(value);
}

export function loadThemeSelection(
  storage: Pick<Storage, "getItem"> | null = defaultStorage(),
): ThemeSelection {
  if (!storage) return "system";
  try {
    const v2 = storage.getItem(THEME_STORAGE_KEY);
    if (isThemeSelection(v2)) return v2;

    const v1 = storage.getItem(LEGACY_THEME_STORAGE_KEY);
    if (v1 && v1 in LEGACY_MAP) return LEGACY_MAP[v1]!;
    return "system";
  } catch {
    return "system";
  }
}

export function saveThemeSelection(
  selection: ThemeSelection,
  storage: Pick<Storage, "setItem"> | null = defaultStorage(),
): void {
  if (!storage) return;
  try {
    storage.setItem(THEME_STORAGE_KEY, selection);
  } catch {
    // Ignore quota / private-mode failures.
  }
}

export function resolveThemeSelection(
  selection: ThemeSelection,
  systemDark: boolean,
): ResolvedTheme {
  const id =
    selection === "system"
      ? systemDark
        ? DEFAULT_DARK_THEME_ID
        : DEFAULT_LIGHT_THEME_ID
      : selection;

  const definition = getThemeById(id) ?? getThemeById(DEFAULT_LIGHT_THEME_ID)!;
  return {
    id: definition.id,
    definition,
    colorScheme: definition.colorScheme,
  };
}

/** Cycle: system → classic → midnight → high-contrast → meadow → system */
export function cycleThemeSelection(
  selection: ThemeSelection,
  themeIds: string[] = [
    DEFAULT_LIGHT_THEME_ID,
    DEFAULT_DARK_THEME_ID,
    "high-contrast",
    "meadow",
  ],
): ThemeSelection {
  if (selection === "system") return themeIds[0] ?? DEFAULT_LIGHT_THEME_ID;
  const idx = themeIds.indexOf(selection);
  if (idx === -1 || idx === themeIds.length - 1) return "system";
  return themeIds[idx + 1]!;
}

export function themeSelectionLabel(
  selection: ThemeSelection,
  resolved?: ResolvedTheme,
): string {
  if (selection === "system") {
    const name = resolved?.definition.name ?? "system";
    return `Theme: system (${name})`;
  }
  const theme = getThemeById(selection);
  return theme ? `Theme: ${theme.name}` : `Theme: ${selection}`;
}

export function themeColorFor(tokens: ThemeTokens): string {
  return tokens.themeColor;
}

type ThemeRoot = {
  setAttribute: (name: string, value: string) => void;
  style: {
    colorScheme: string;
    setProperty: (name: string, value: string) => void;
  };
};

type ThemeMeta = {
  setAttribute: (name: string, value: string) => void;
};

/** Apply resolved theme tokens onto the document root. */
export function applyResolvedTheme(
  resolved: ResolvedTheme,
  root: ThemeRoot,
  meta?: ThemeMeta | null,
): void {
  const { definition, colorScheme } = resolved;
  root.setAttribute("data-theme", definition.id);
  root.setAttribute("data-color-scheme", colorScheme);
  root.style.colorScheme = colorScheme;

  for (const key of Object.keys(TOKEN_CSS_VARS) as (keyof ThemeTokens)[]) {
    root.style.setProperty(TOKEN_CSS_VARS[key], definition.tokens[key]);
  }

  meta?.setAttribute("content", themeColorFor(definition.tokens));
}

// --- Back-compat aliases used by dark-mode PR surface ---
/** @deprecated Prefer ThemeSelection */
export type ThemePreference = ThemeSelection;
/** @deprecated Prefer loadThemeSelection */
export const loadThemePreference = loadThemeSelection;
/** @deprecated Prefer saveThemeSelection */
export const saveThemePreference = saveThemeSelection;
/** @deprecated Prefer cycleThemeSelection */
export const cycleThemePreference = cycleThemeSelection;
/** @deprecated Prefer themeSelectionLabel */
export const themePreferenceLabel = themeSelectionLabel;
/** @deprecated Prefer isThemeSelection */
export const isThemePreference = isThemeSelection;

function defaultStorage(): Pick<Storage, "getItem" | "setItem"> | null {
  if (typeof window === "undefined" || !window.localStorage) return null;
  return window.localStorage;
}
