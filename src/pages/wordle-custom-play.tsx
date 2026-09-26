import { Link, useParams } from "react-router-dom";
import { AppShell } from "@/components/app-shell";
import { ThemeToggle } from "@/components/theme-toggle";
import { CustomWordleGame } from "@/components/wordle/custom-game";
import {
  decodeErrorMessage,
  decodeSolution,
} from "@/lib/wordle-builder";

export function WordleCustomPlayPage() {
  const { code = "" } = useParams<{ code: string }>();
  const decoded = decodeSolution(code);

  if (!decoded.ok) {
    return (
      <AppShell
        headerClassName="flex items-center justify-between px-3 pt-[max(0.5rem,env(safe-area-inset-top))] pb-2 sm:px-5"
        bodyClassName="flex flex-col items-center justify-center gap-4 px-6 text-center"
        header={
          <>
            <Link
              to="/"
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md px-2 text-xs font-semibold tracking-wide text-[var(--ink-muted)] uppercase hover:bg-[var(--key-bg)] hover:text-[var(--ink)]"
            >
              Home
            </Link>
            <p className="font-display text-xl font-semibold text-[var(--ink)]">
              Tonni Games
            </p>
            <ThemeToggle />
          </>
        }
      >
        <h1 className="font-display text-2xl font-semibold text-[var(--ink)]">
          Puzzle not found
        </h1>
        <p className="max-w-sm text-sm text-[var(--ink-muted)]">
          {decodeErrorMessage(decoded.error)}. Ask for a fresh link, or build
          your own.
        </p>
        <Link
          to="/wordle/builder"
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-[var(--accent-brand)] px-6 text-sm font-bold tracking-wide text-white uppercase"
        >
          Wordle Builder
        </Link>
      </AppShell>
    );
  }

  return <CustomWordleGame key={code} code={code} solution={decoded.word} />;
}
