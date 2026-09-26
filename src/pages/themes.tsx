import { Link } from "react-router-dom";
import { ArrowLeft, Check, Monitor } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useTheme } from "@/components/theme-context";
import { cn } from "@/lib/utils";
import {
  THEME_ROW_BASE,
  themeRowSelectedClass,
  themeSelectIndicatorClass,
} from "@/lib/theme-ui";
import type { ThemeDefinition } from "@/themes/registry";

function SelectionCheck({ selected }: { selected: boolean }) {
  return (
    <span
      className={themeSelectIndicatorClass(selected)}
      aria-hidden={!selected}
    >
      <Check className="h-4 w-4" aria-hidden />
      {selected ? <span className="sr-only">Selected</span> : null}
    </span>
  );
}

function ThemeCard({
  theme,
  selected,
  onSelect,
}: {
  theme: ThemeDefinition;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        THEME_ROW_BASE,
        "min-h-[9.5rem] flex-col gap-3",
        themeRowSelectedClass(selected),
      )}
      style={{ touchAction: "manipulation" }}
    >
      <div
        className="flex h-14 shrink-0 overflow-hidden rounded-md border border-[var(--panel-border)]"
        aria-hidden
      >
        <span
          className="flex-1"
          style={{ background: theme.preview.background }}
        />
        <span className="w-1/4" style={{ background: theme.preview.accent }} />
        <span className="w-1/4" style={{ background: theme.preview.tile }} />
      </div>
      <div className="flex min-h-[3.25rem] items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-[var(--ink)]">{theme.name}</p>
          <p className="mt-0.5 line-clamp-2 text-sm text-[var(--ink-muted)]">
            {theme.description}
          </p>
        </div>
        <SelectionCheck selected={selected} />
      </div>
    </button>
  );
}

export function ThemesPage() {
  const { selection, themes, setSelection, resolved } = useTheme();

  return (
    <AppShell
      headerClassName="flex items-center gap-2 px-5 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]"
      bodyClassName="px-5 py-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
      header={
        <>
          <Link
            to="/"
            className="inline-flex h-11 w-11 items-center justify-center rounded-md text-[var(--ink-muted)] hover:bg-[var(--key-bg)] hover:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-brand)]"
            aria-label="Back to home"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden />
          </Link>
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-[var(--ink)]">
              Themes
            </h1>
            <p className="text-sm text-[var(--ink-muted)]">
              Looks apply across home and every game.
            </p>
          </div>
        </>
      }
    >
      <section aria-label="Theme options" className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => setSelection("system")}
          aria-pressed={selection === "system"}
          className={cn(
            THEME_ROW_BASE,
            "min-h-[4.75rem] items-center gap-3",
            themeRowSelectedClass(selection === "system"),
          )}
          style={{ touchAction: "manipulation" }}
        >
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[var(--key-bg)] text-[var(--ink)]">
            <Monitor className="h-5 w-5" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-semibold text-[var(--ink)]">System</span>
            <span className="mt-0.5 block line-clamp-2 text-sm text-[var(--ink-muted)]">
              Follow device — Classic by day, Midnight by night (now{" "}
              {resolved.definition.name}).
            </span>
          </span>
          <SelectionCheck selected={selection === "system"} />
        </button>

        {themes.map((theme) => (
          <ThemeCard
            key={theme.id}
            theme={theme}
            selected={selection === theme.id}
            onSelect={() => setSelection(theme.id)}
          />
        ))}
      </section>

      <p className="mt-8 text-center text-xs text-[var(--ink-muted)]">
        Choice saved on this device. New games pick up the same tokens.
      </p>
    </AppShell>
  );
}
