import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/theme-toggle";

export function HomePage() {
  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-lg flex-col items-center justify-center px-6 py-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] text-center">
      <div className="absolute top-[max(0.5rem,env(safe-area-inset-top))] right-2 sm:right-4">
        <ThemeToggle />
      </div>
      <h1 className="font-display text-4xl font-semibold tracking-tight text-[var(--ink)] sm:text-5xl">
        Tonni Games
      </h1>
      <p className="mt-3 max-w-sm text-[var(--ink-muted)]">
        Free puzzle games for Tonni. No paywall, no play limits.
      </p>
      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
        <Link
          to="/wordle"
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-[var(--accent-brand)] px-6 py-3 text-sm font-bold tracking-wide text-white uppercase transition hover:brightness-110 active:scale-[0.98]"
          style={{ touchAction: "manipulation" }}
        >
          Play Wordle
        </Link>
        <Link
          to="/themes"
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-[var(--panel-border)] bg-[var(--panel)] px-6 py-3 text-sm font-semibold tracking-wide text-[var(--ink)] transition hover:border-[var(--ink-muted)] active:scale-[0.98]"
          style={{ touchAction: "manipulation" }}
        >
          Themes
        </Link>
      </div>
    </div>
  );
}
