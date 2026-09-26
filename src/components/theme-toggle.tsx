import { Link } from "react-router-dom";
import { Monitor, Moon, Palette, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-context";
import { themeSelectionLabel } from "@/lib/theme";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  /** When true, cycles themes. Default links to /themes. */
  cycle?: boolean;
}

export function ThemeToggle({ className, cycle = false }: ThemeToggleProps) {
  const { selection, resolved, cycleSelection } = useTheme();
  const Icon =
    selection === "system"
      ? Monitor
      : resolved.colorScheme === "dark"
        ? Moon
        : Sun;

  const baseClass = cn(
    "inline-flex h-11 w-11 items-center justify-center rounded-md text-[var(--ink-muted)] hover:bg-[var(--key-bg)] hover:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-brand)]",
    className,
  );

  if (!cycle) {
    return (
      <Link
        to="/themes"
        className={baseClass}
        aria-label="Themes"
        title="Themes"
        data-theme-selection={selection}
      >
        <Palette className="h-5 w-5" aria-hidden />
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={baseClass}
      onClick={cycleSelection}
      aria-label={themeSelectionLabel(selection, resolved)}
      title={themeSelectionLabel(selection, resolved)}
      data-theme-selection={selection}
    >
      <Icon className="h-5 w-5" aria-hidden />
    </button>
  );
}
