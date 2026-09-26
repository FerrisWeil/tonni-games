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
  cycleThemePreference,
  loadThemePreference,
  resolveTheme,
  saveThemePreference,
  type ResolvedTheme,
  type ThemePreference,
} from "@/lib/theme";

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
  const [preference, setPreferenceState] = useState<ThemePreference>(() =>
    loadThemePreference(),
  );
  const [systemDark, setSystemDark] = useState(readSystemDark);

  const resolved = useMemo(
    () => resolveTheme(preference, systemDark),
    [preference, systemDark],
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

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    saveThemePreference(next);
  }, []);

  const cyclePreference = useCallback(() => {
    setPreferenceState((prev) => {
      const next = cycleThemePreference(prev);
      saveThemePreference(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ preference, resolved, cyclePreference, setPreference }),
    [preference, resolved, cyclePreference, setPreference],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
