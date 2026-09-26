import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ThemeContext } from "@/components/theme-context";
import {
  applyResolvedTheme,
  cycleThemeSelection,
  loadThemeSelection,
  resolveThemeSelection,
  saveThemeSelection,
  type ResolvedTheme,
  type ThemeSelection,
} from "@/lib/theme";
import { listThemes } from "@/themes/registry";

function readSystemDark(): boolean {
  return (
    typeof window !== "undefined" &&
    !!window.matchMedia?.("(prefers-color-scheme: dark)").matches
  );
}

function syncDocumentTheme(resolved: ResolvedTheme): void {
  if (typeof document === "undefined") return;
  applyResolvedTheme(
    resolved,
    document.documentElement,
    document.querySelector('meta[name="theme-color"]'),
  );
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [selection, setSelectionState] = useState<ThemeSelection>(() =>
    loadThemeSelection(),
  );
  const [systemDark, setSystemDark] = useState(readSystemDark);
  const themes = useMemo(() => listThemes(), []);

  const resolved = useMemo(
    () => resolveThemeSelection(selection, systemDark),
    [selection, systemDark],
  );

  useEffect(() => {
    syncDocumentTheme(resolved);
  }, [resolved]);

  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!mq) return;

    const onChange = (event: MediaQueryListEvent) => {
      setSystemDark(event.matches);
    };

    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const setSelection = useCallback((next: ThemeSelection) => {
    setSelectionState(next);
    saveThemeSelection(next);
  }, []);

  const cycleSelection = useCallback(() => {
    setSelectionState((prev) => {
      const next = cycleThemeSelection(prev);
      saveThemeSelection(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      selection,
      resolved,
      themes,
      setSelection,
      cycleSelection,
      preference: selection,
      cyclePreference: cycleSelection,
      setPreference: setSelection,
    }),
    [selection, resolved, themes, setSelection, cycleSelection],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
