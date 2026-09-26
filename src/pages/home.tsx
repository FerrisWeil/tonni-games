import { useEffect } from "react";
import { Link } from "react-router-dom";
import { UserRound } from "lucide-react";
import { useAuth } from "@/components/auth-context";
import { ThemeToggle } from "@/components/theme-toggle";

const HOME_SCROLL_LOCK = "home-scroll-lock";

export function HomePage() {
  const { user, status, configured } = useAuth();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add(HOME_SCROLL_LOCK);
    return () => {
      root.classList.remove(HOME_SCROLL_LOCK);
    };
  }, []);

  const accountLabel =
    status === "loading"
      ? "Account"
      : user
        ? user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split("@")[0] ||
          "Account"
        : configured
          ? "Sign in"
          : "Account";

  return (
    <div className="home-shell relative mx-auto flex h-dvh max-h-dvh w-full max-w-lg flex-col items-center justify-center overflow-hidden px-6 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] text-center">
      <div className="absolute top-[max(0.5rem,env(safe-area-inset-top))] right-2 flex items-center gap-1 sm:right-4">
        <Link
          to="/account"
          className="inline-flex min-h-11 max-w-[9rem] items-center gap-1.5 rounded-md px-2.5 text-sm font-medium text-[var(--ink-muted)] transition hover:bg-[var(--key-bg)] hover:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-brand)]"
          aria-label={user ? `Account — ${accountLabel}` : "Sign in"}
          style={{ touchAction: "manipulation" }}
        >
          <UserRound className="h-5 w-5 shrink-0" aria-hidden />
          <span className="truncate">{accountLabel}</span>
        </Link>
        <ThemeToggle />
      </div>
      <h1 className="font-display text-[clamp(1.75rem,7vmin,3rem)] font-semibold tracking-tight text-[var(--ink)]">
        Tonni Games
      </h1>
      <p className="home-tagline mt-3 max-w-sm text-[var(--ink-muted)]">
        Free puzzle games for Tonni. No paywall, no play limits.
      </p>
      <div className="home-cta mt-6 flex w-full max-w-xs flex-col gap-2.5 sm:mt-8 sm:max-w-none sm:flex-row sm:flex-wrap sm:justify-center sm:gap-3">
        <Link
          to="/wordle"
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-[var(--accent-brand)] px-6 py-3 text-sm font-bold tracking-wide text-white uppercase transition hover:brightness-110 active:scale-[0.98]"
          style={{ touchAction: "manipulation" }}
        >
          Play Wordle
        </Link>
        <Link
          to="/wordle/builder"
          className="inline-flex min-h-11 items-center justify-center rounded-md border-2 border-[var(--accent-brand)] bg-transparent px-6 py-3 text-sm font-bold tracking-wide text-[var(--accent-brand)] uppercase transition hover:bg-[var(--accent-brand)]/10 active:scale-[0.98]"
          style={{ touchAction: "manipulation" }}
        >
          Wordle Builder
        </Link>
        <Link
          to="/connections"
          className="inline-flex min-h-11 items-center justify-center rounded-md border-2 border-[var(--accent-brand)] bg-transparent px-6 py-3 text-sm font-bold tracking-wide text-[var(--accent-brand)] uppercase transition hover:bg-[var(--accent-brand)]/10 active:scale-[0.98]"
          style={{ touchAction: "manipulation" }}
        >
          Play Connections
        </Link>
        <Link
          to="/mastermind"
          className="inline-flex min-h-11 items-center justify-center rounded-md border-2 border-[var(--accent-brand)] bg-transparent px-6 py-3 text-sm font-bold tracking-wide text-[var(--accent-brand)] uppercase transition hover:bg-[var(--accent-brand)]/10 active:scale-[0.98]"
          style={{ touchAction: "manipulation" }}
        >
          Play Mastermind
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
