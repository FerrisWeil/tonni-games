/**
 * Theme registry — extension point for Tonni Games themes (ADR 0012).
 *
 * To add a built-in theme:
 * 1. Define a ThemeDefinition with id, name, colorScheme, and tokens.
 * 2. Append it to BUILTIN_THEMES below.
 * 3. Games already read CSS variables; no Wordle/board rewrites needed.
 *
 * Future custom themes can push into a mutable registry (see registerTheme)
 * without changing game components.
 */

export type ColorScheme = "light" | "dark";

/** CSS custom properties games and chrome consume. */
export interface ThemeTokens {
  background: string;
  ink: string;
  inkMuted: string;
  panel: string;
  panelBorder: string;
  accentBrand: string;
  tileBorder: string;
  tileBorderFilled: string;
  tileCorrect: string;
  tilePresent: string;
  tileAbsent: string;
  keyBg: string;
  barTrack: string;
  bgGlowTop: string;
  bgGlowBr: string;
  bgGlowBl: string;
  /** Browser chrome / theme-color meta */
  themeColor: string;
}

export interface ThemePreview {
  background: string;
  accent: string;
  tile: string;
}

export interface ThemeDefinition {
  id: string;
  name: string;
  description: string;
  colorScheme: ColorScheme;
  tokens: ThemeTokens;
  preview: ThemePreview;
}

const CLASSIC_TOKENS: ThemeTokens = {
  background: "#e8efe6",
  ink: "#1c2420",
  inkMuted: "#5a6b61",
  panel: "#f4f7f2",
  panelBorder: "#c5d2c4",
  accentBrand: "#2f6b4f",
  tileBorder: "#a8b8aa",
  tileBorderFilled: "#1c2420",
  tileCorrect: "#3a8f5c",
  tilePresent: "#c9a227",
  tileAbsent: "#6b756e",
  keyBg: "#d0dbce",
  barTrack: "#d5e0d2",
  bgGlowTop: "#f7faf5",
  bgGlowBr: "#d4e3d6",
  bgGlowBl: "#dde8da",
  themeColor: "#e8efe6",
};

const MIDNIGHT_TOKENS: ThemeTokens = {
  background: "#121a16",
  ink: "#e8efe6",
  inkMuted: "#9aaba0",
  panel: "#1a2420",
  panelBorder: "#2f3f36",
  accentBrand: "#5cb87f",
  tileBorder: "#3d4f44",
  tileBorderFilled: "#e8efe6",
  tileCorrect: "#3a8f5c",
  tilePresent: "#d4ae3a",
  tileAbsent: "#3d4540",
  keyBg: "#2a3530",
  barTrack: "#2a3530",
  bgGlowTop: "#1c2a22",
  bgGlowBr: "#152018",
  bgGlowBl: "#18241c",
  themeColor: "#121a16",
};

const HIGH_CONTRAST_TOKENS: ThemeTokens = {
  background: "#0a0a0a",
  ink: "#ffffff",
  inkMuted: "#d0d0d0",
  panel: "#141414",
  panelBorder: "#ffffff",
  accentBrand: "#ffffff",
  tileBorder: "#ffffff",
  tileBorderFilled: "#ffffff",
  tileCorrect: "#00c853",
  tilePresent: "#ffd600",
  tileAbsent: "#424242",
  keyBg: "#2a2a2a",
  barTrack: "#2a2a2a",
  bgGlowTop: "#1a1a1a",
  bgGlowBr: "#0a0a0a",
  bgGlowBl: "#0a0a0a",
  themeColor: "#0a0a0a",
};

/** Playful warm moss / ochre — not purple AI-slop. */
const MEADOW_TOKENS: ThemeTokens = {
  background: "#f3eee3",
  ink: "#2a2418",
  inkMuted: "#6e6454",
  panel: "#faf6ee",
  panelBorder: "#d6cdb8",
  accentBrand: "#6b7c3c",
  tileBorder: "#b8ad96",
  tileBorderFilled: "#2a2418",
  tileCorrect: "#5a8f3c",
  tilePresent: "#c47a2c",
  tileAbsent: "#7a7368",
  keyBg: "#e4dcc8",
  barTrack: "#e4dcc8",
  bgGlowTop: "#faf7f0",
  bgGlowBr: "#e8dfc8",
  bgGlowBl: "#ebe4d4",
  themeColor: "#f3eee3",
};

/** Built-in themes. Order = picker display order. */
export const BUILTIN_THEMES: readonly ThemeDefinition[] = [
  {
    id: "classic",
    name: "Classic",
    description: "Tonni default — soft moss green and clear board tokens.",
    colorScheme: "light",
    tokens: CLASSIC_TOKENS,
    preview: {
      background: CLASSIC_TOKENS.background,
      accent: CLASSIC_TOKENS.accentBrand,
      tile: CLASSIC_TOKENS.tileCorrect,
    },
  },
  {
    id: "midnight",
    name: "Midnight",
    description: "Low-light Tonni dark — same brand, easier night play.",
    colorScheme: "dark",
    tokens: MIDNIGHT_TOKENS,
    preview: {
      background: MIDNIGHT_TOKENS.background,
      accent: MIDNIGHT_TOKENS.accentBrand,
      tile: MIDNIGHT_TOKENS.tileCorrect,
    },
  },
  {
    id: "high-contrast",
    name: "High Contrast",
    description: "Near-black surfaces, white chrome, vivid evaluation colors.",
    colorScheme: "dark",
    tokens: HIGH_CONTRAST_TOKENS,
    preview: {
      background: HIGH_CONTRAST_TOKENS.background,
      accent: HIGH_CONTRAST_TOKENS.accentBrand,
      tile: HIGH_CONTRAST_TOKENS.tileCorrect,
    },
  },
  {
    id: "meadow",
    name: "Meadow",
    description: "Warm parchment with moss and ochre accents.",
    colorScheme: "light",
    tokens: MEADOW_TOKENS,
    preview: {
      background: MEADOW_TOKENS.background,
      accent: MEADOW_TOKENS.accentBrand,
      tile: MEADOW_TOKENS.tilePresent,
    },
  },
] as const;

export const DEFAULT_LIGHT_THEME_ID = "classic";
export const DEFAULT_DARK_THEME_ID = "midnight";

const extraThemes: ThemeDefinition[] = [];

/** Register a custom theme at runtime (future extension). */
export function registerTheme(theme: ThemeDefinition): void {
  const existing = listThemes().find((t) => t.id === theme.id);
  if (existing) {
    throw new Error(`Theme id already registered: ${theme.id}`);
  }
  extraThemes.push(theme);
}

/** Test helper — clears runtime-registered themes. */
export function clearRegisteredThemes(): void {
  extraThemes.length = 0;
}

export function listThemes(): ThemeDefinition[] {
  return [...BUILTIN_THEMES, ...extraThemes];
}

export function getThemeById(id: string): ThemeDefinition | undefined {
  return listThemes().find((t) => t.id === id);
}

export function isThemeId(value: unknown): value is string {
  return typeof value === "string" && !!getThemeById(value);
}

/** Map ThemeTokens → CSS custom property names. */
export const TOKEN_CSS_VARS: Record<keyof ThemeTokens, string> = {
  background: "--background",
  ink: "--ink",
  inkMuted: "--ink-muted",
  panel: "--panel",
  panelBorder: "--panel-border",
  accentBrand: "--accent-brand",
  tileBorder: "--tile-border",
  tileBorderFilled: "--tile-border-filled",
  tileCorrect: "--tile-correct",
  tilePresent: "--tile-present",
  tileAbsent: "--tile-absent",
  keyBg: "--key-bg",
  barTrack: "--bar-track",
  bgGlowTop: "--bg-glow-top",
  bgGlowBr: "--bg-glow-br",
  bgGlowBl: "--bg-glow-bl",
  themeColor: "--theme-color",
};
