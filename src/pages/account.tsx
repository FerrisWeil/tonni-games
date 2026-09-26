import { useId, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useAuth } from "@/components/auth-context";
import { TonniTiles } from "@/components/tonni-tiles";

function GoogleMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="18"
      height="18"
      aria-hidden
    >
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        opacity="0.9"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        opacity="0.75"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        opacity="0.85"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        opacity="0.95"
      />
    </svg>
  );
}

export function AccountPage() {
  const {
    status,
    configured,
    user,
    signInWithGoogle,
    signInWithMagicLink,
    signOut,
  } = useAuth();
  const emailId = useId();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState<"google" | "magic" | "out" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const disabled = !configured || status === "loading" || busy !== null;

  async function onGoogle() {
    setError(null);
    setMessage(null);
    setBusy("google");
    const { error: err } = await signInWithGoogle();
    setBusy(null);
    if (err) setError(err);
  }

  async function onMagic(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setBusy("magic");
    const { error: err } = await signInWithMagicLink(email);
    setBusy(null);
    if (err) {
      setError(err);
      return;
    }
    setMessage(`Check ${email.trim()} for your magic link.`);
  }

  async function onSignOut() {
    setError(null);
    setMessage(null);
    setBusy("out");
    const { error: err } = await signOut();
    setBusy(null);
    if (err) setError(err);
  }

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email ||
    "Signed in";
  const avatarUrl =
    (user?.user_metadata?.avatar_url as string | undefined) ||
    (user?.user_metadata?.picture as string | undefined);

  return (
    <AppShell
      headerClassName="flex items-center gap-2 px-4 py-2 pt-[max(0.75rem,env(safe-area-inset-top))]"
      bodyClassName="flex flex-col px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
      header={
        <>
          <Link
            to="/"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-[var(--ink)] hover:bg-[var(--key-bg)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-brand)]"
            aria-label="Back to home"
            style={{ touchAction: "manipulation" }}
          >
            <ArrowLeft className="h-5 w-5" aria-hidden />
          </Link>
          <h1 className="font-semibold text-[var(--ink)]">Account</h1>
        </>
      }
    >
      <div className="mx-auto my-auto flex w-full max-w-sm flex-col items-center text-center">
        <TonniTiles className="mb-6" />

        {user ? (
          <>
            <h2 className="font-display text-[clamp(1.75rem,6vmin,2.25rem)] font-semibold tracking-tight text-[var(--ink)]">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-[var(--ink-muted)]">
              You&apos;re signed in. Packs and progress can sync when that lands.
            </p>
            <div className="mt-8 flex w-full flex-col items-center gap-3 rounded-lg border border-[var(--panel-border)] bg-[var(--panel)] px-4 py-5">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt=""
                  className="h-14 w-14 rounded-full border border-[var(--panel-border)] object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent-brand)] text-lg font-bold text-white">
                  {(displayName[0] ?? "?").toUpperCase()}
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate font-semibold text-[var(--ink)]">
                  {displayName}
                </p>
                {user.email ? (
                  <p className="truncate text-sm text-[var(--ink-muted)]">
                    {user.email}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={onSignOut}
                disabled={busy !== null}
                className="mt-2 inline-flex min-h-11 w-full items-center justify-center rounded-md border border-[var(--panel-border)] bg-transparent px-4 text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--key-bg)] disabled:opacity-60"
                style={{ touchAction: "manipulation" }}
              >
                {busy === "out" ? "Signing out…" : "Sign out"}
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="font-display text-[clamp(1.75rem,6vmin,2.25rem)] font-semibold tracking-tight text-[var(--ink)]">
              Sign in to Tonni
            </h2>
            <p className="mt-2 text-sm text-[var(--ink-muted)]">
              Save your puzzle packs and progress.
            </p>

            {!configured ? (
              <p
                className="mt-6 w-full rounded-md border border-[var(--panel-border)] bg-[var(--panel)] px-4 py-3 text-sm text-[var(--ink)]"
                role="status"
              >
                Sign-in unavailable — add{" "}
                <code className="text-xs">VITE_SUPABASE_URL</code> and{" "}
                <code className="text-xs">VITE_SUPABASE_ANON_KEY</code> (see
                plan). Games still work without an account.
              </p>
            ) : null}

            <button
              type="button"
              onClick={onGoogle}
              disabled={disabled}
              className="mt-8 inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-md bg-[var(--accent-brand)] px-4 text-sm font-semibold text-white transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              style={{ touchAction: "manipulation" }}
            >
              <GoogleMark />
              {busy === "google" ? "Redirecting…" : "Continue with Google"}
            </button>

            <form onSubmit={onMagic} className="mt-4 flex w-full flex-col gap-3">
              <label htmlFor={emailId} className="sr-only">
                Email address
              </label>
              <input
                id={emailId}
                type="email"
                name="email"
                autoComplete="email"
                inputMode="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={disabled}
                className="min-h-12 w-full rounded-md border border-[var(--panel-border)] bg-[var(--panel)] px-4 text-sm text-[var(--ink)] placeholder:text-[var(--ink-muted)] outline-none focus-visible:border-[var(--accent-brand)] focus-visible:ring-2 focus-visible:ring-[var(--accent-brand)]/30 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={disabled || !email.trim()}
                className="min-h-11 text-sm font-bold text-[var(--accent-brand)] transition hover:underline disabled:cursor-not-allowed disabled:opacity-50 disabled:no-underline"
                style={{ touchAction: "manipulation" }}
              >
                {busy === "magic" ? "Sending…" : "Email magic link"}
              </button>
            </form>
          </>
        )}

        {error ? (
          <p className="mt-4 text-sm text-red-700 dark:text-red-300" role="alert">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="mt-4 text-sm text-[var(--ink)]" role="status">
            {message}
          </p>
        ) : null}

        <p className="mt-10 text-xs text-[var(--ink-muted)]">
          Personal &amp; family — free, no paywall
        </p>
      </div>
    </AppShell>
  );
}
