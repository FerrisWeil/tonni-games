import { Link } from "react-router-dom";
import { ArrowLeft, Check, Monitor } from "lucide-react";
import { useTheme } from "@/components/theme-context";
import { cn } from "@/lib/utils";
import type { ThemeDefinition } from "@/themes/registry";

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
        "relative flex w-full flex-col gap-3 rounded-lg border p-4 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-brand)]",
        selected
          ? "border-[var(--accent-brand)] bg-[var(--panel)] shadow-[0_0_0_1px_var(--accent-brand)]"
          : "border-[var(--panel-border)] bg-[var(--panel)]/60 hover:border-[var(--ink-muted)]",
      )}
      style={{ touchAction: "manipulation" }}
    >
      <div
        className="flex h-14 overflow-hidden rounded-md border border-[var(--panel-border)]"
        aria-hidden
      >
        <span
          className="flex-1"
          style={{ background: theme.preview.background }}
        />
        <span className="w-1/4" style={{ background: theme.preview.accent }} />
        <span className="w-1/4" style={{ background: theme.preview.tile }} />
      </div>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-[var(--ink)]">{theme.name}</p>
          <p className="mt-0.5 text-sm text-[var(--ink-muted)]">
            {theme.description}
          </p>
        </div>
        {selected ? (
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent-brand)] text-white">
            <Check className="h-4 w-4" aria-hidden />
            <span className="sr-only">Selected</span>
          </span>
        ) : null}
      </div>
    </button>
  );
}

export function ThemesPage() {
  const { selection, themes, setSelection, resolved } = useTheme();

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-5 py-[max(1rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <header className="mb-6 flex items-center gap-2">
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
      </header>

      <section aria-label="Theme options" className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => setSelection("system")}
          aria-pressed={selection === "system"}
          className={cn(
            "relative flex w-full items-center gap-3 rounded-lg border p-4 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-brand)]",
            selection === "system"
              ? "border-[var(--accent-brand)] bg-[var(--panel)] shadow-[0_0_0_1px_var(--accent-brand)]"
              : "border-[var(--panel-border)] bg-[var(--panel)]/60 hover:border-[var(--ink-muted)]",
          )}
          style={{ touchAction: "manipulation" }}
        >
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-[var(--key-bg)] text-[var(--ink)]">
            <Monitor className="h-5 w-5" aria-hidden />
          </span>
          <span className="flex-1">
            <span className="block font-semibold text-[var(--ink)]">System</span>
            <span className="block text-sm text-[var(--ink-muted)]">
              Follow device — Classic by day, Midnight by night
              {selection === "system" ? ` (now ${resolved.definition.name})` : ""}.
            </span>
          </span>
          {selection === "system" ? (
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent-brand)] text-white">
              <Check className="h-4 w-4" aria-hidden />
            </span>
          ) : null}
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
    </div>
  );
}
