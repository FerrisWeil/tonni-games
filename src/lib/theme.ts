export type ThemePreference = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "tonni-theme-v1";

const THEME_COLOR = {
  light: "#e8efe6",
  dark: "#121a16",
} as const;

export function isThemePreference(value: unknown): value is ThemePreference {
  return value === "system" || value === "light" || value === "dark";
}

export function loadThemePreference(
  storage: Pick<Storage, "getItem"> | null = defaultStorage(),
): ThemePreference {
  if (!storage) return "system";
  try {
    const raw = storage.getItem(THEME_STORAGE_KEY);
    return isThemePreference(raw) ? raw : "system";
  } catch {
    return "system";
  }
}

export function saveThemePreference(
  preference: ThemePreference,
  storage: Pick<Storage, "setItem"> | null = defaultStorage(),
): void {
  if (!storage) return;
  try {
    storage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // Ignore quota / private-mode failures.
  }
}

export function resolveTheme(
  preference: ThemePreference,
  systemDark: boolean,
): ResolvedTheme {
  if (preference === "light") return "light";
  if (preference === "dark") return "dark";
  return systemDark ? "dark" : "light";
}

export function cycleThemePreference(
  preference: ThemePreference,
): ThemePreference {
  if (preference === "system") return "light";
  if (preference === "light") return "dark";
  return "system";
}

export function themePreferenceLabel(preference: ThemePreference): string {
  if (preference === "system") return "Theme: system";
  if (preference === "light") return "Theme: light";
  return "Theme: dark";
}

export function themeColorFor(theme: ResolvedTheme): string {
  return THEME_COLOR[theme];
}

type ThemeRoot = {
  setAttribute: (name: string, value: string) => void;
  style: { colorScheme: string };
};

type ThemeMeta = {
  setAttribute: (name: string, value: string) => void;
};

export function applyResolvedTheme(
  theme: ResolvedTheme,
  root: ThemeRoot,
  meta?: ThemeMeta | null,
): void {
  root.setAttribute("data-theme", theme);
  root.style.colorScheme = theme;
  meta?.setAttribute("content", themeColorFor(theme));
}

function defaultStorage(): Pick<Storage, "getItem" | "setItem"> | null {
  if (typeof window === "undefined" || !window.localStorage) return null;
  return window.localStorage;
}
