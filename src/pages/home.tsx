import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col items-center justify-center px-6 text-center">
      <h1 className="font-display text-4xl font-semibold tracking-tight text-[var(--ink)] sm:text-5xl">
        Tonni Games
      </h1>
      <p className="mt-3 max-w-sm text-[var(--ink-muted)]">
        Free puzzle games for Tonni. No paywall, no play limits.
      </p>
      <Link
        to="/wordle"
        className="mt-8 inline-flex items-center justify-center rounded-md bg-[var(--accent-brand)] px-6 py-3 text-sm font-bold tracking-wide text-white uppercase transition hover:brightness-110 active:scale-[0.98]"
      >
        Play Wordle
      </Link>
    </div>
  );
}
