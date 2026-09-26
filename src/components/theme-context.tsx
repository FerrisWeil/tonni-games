import { createContext, useContext } from "react";
import type { ResolvedTheme, ThemeSelection } from "@/lib/theme";
import type { ThemeDefinition } from "@/themes/registry";

export interface ThemeContextValue {
  /** Persisted selection: "system" or a theme id. */
  selection: ThemeSelection;
  /** Resolved concrete theme after system preference. */
  resolved: ResolvedTheme;
  themes: ThemeDefinition[];
  setSelection: (selection: ThemeSelection) => void;
  cycleSelection: () => void;
  /** @deprecated Alias for selection (dark-mode PR compat). */
  preference: ThemeSelection;
  /** @deprecated Alias for cycleSelection. */
  cyclePreference: () => void;
  /** @deprecated Alias for setSelection. */
  setPreference: (selection: ThemeSelection) => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
