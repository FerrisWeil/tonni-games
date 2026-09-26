import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-context";
import { themePreferenceLabel } from "@/lib/theme";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { preference, cyclePreference } = useTheme();
  const Icon =
    preference === "dark" ? Moon : preference === "light" ? Sun : Monitor;

  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-11 w-11 items-center justify-center rounded-md text-[var(--ink-muted)] hover:bg-[var(--key-bg)] hover:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-brand)]",
        className,
      )}
      onClick={cyclePreference}
      aria-label={themePreferenceLabel(preference)}
      title={themePreferenceLabel(preference)}
      data-theme-preference={preference}
    >
      <Icon className="h-5 w-5" aria-hidden />
    </button>
  );
}
