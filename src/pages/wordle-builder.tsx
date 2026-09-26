import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Copy, Play } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ThemeToggle } from "@/components/theme-toggle";
import { copyShareText } from "@/lib/share";
import {
  BUILDER_MAX_LENGTH,
  BUILDER_MIN_LENGTH,
  builderPlayPath,
  encodeErrorMessage,
  encodeSolution,
  maxGuessesForLength,
  normalizeSolutionInput,
} from "@/lib/wordle-builder";

export function WordleBuilderPage() {
  const [raw, setRaw] = useState("");
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  const normalized = useMemo(() => normalizeSolutionInput(raw), [raw]);
  const encoded = useMemo(() => encodeSolution(normalized), [normalized]);

  const shareUrl = useMemo(() => {
    if (!encoded.ok) return "";
    const path = builderPlayPath(encoded.code);
    if (typeof window === "undefined") return path;
    return `${window.location.origin}${path}`;
  }, [encoded]);

  const onCopy = useCallback(async () => {
    if (!shareUrl) return;
    const ok = await copyShareText(shareUrl);
    setCopied(ok);
    setCopyError(!ok);
    if (ok) setTimeout(() => setCopied(false), 2000);
  }, [shareUrl]);

  const lengthHint = (() => {
    if (!normalized) {
      return `${BUILDER_MIN_LENGTH}–${BUILDER_MAX_LENGTH} letters · A–Z`;
    }
    if (encoded.ok) {
      return `${encoded.length} letters · ${maxGuessesForLength(encoded.length)} guesses`;
    }
    return encodeErrorMessage(encoded.error);
  })();

  return (
    <AppShell
      headerClassName="flex items-center justify-between px-3 pt-[max(0.5rem,env(safe-area-inset-top))] pb-2 sm:px-5"
      bodyClassName="flex flex-col px-5 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
      header={
        <>
          <Link
            to="/"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md px-2 text-xs font-semibold tracking-wide text-[var(--ink-muted)] uppercase hover:bg-[var(--key-bg)] hover:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-brand)]"
          >
            Home
          </Link>
          <div className="text-center">
            <p className="font-display text-2xl leading-none font-semibold tracking-tight text-[var(--ink)] sm:text-3xl">
              Tonni Games
            </p>
            <p className="mt-0.5 text-[10px] font-semibold tracking-[0.2em] text-[var(--accent-brand)] uppercase">
              Wordle Builder
            </p>
          </div>
          <ThemeToggle />
        </>
      }
    >
      <h1 className="font-display text-2xl font-semibold tracking-tight text-[var(--ink)]">
        Make a custom Wordle
      </h1>
      <p className="mt-2 text-sm text-[var(--ink-muted)]">
        Pick a word, copy the link, and share it. No account — the puzzle lives
        in the URL.
      </p>

      <label className="mt-8 block">
        <span className="text-xs font-semibold tracking-wide text-[var(--ink-muted)] uppercase">
          Solution word
        </span>
        <input
          type="text"
          value={raw}
          onChange={(e) => {
            setRaw(e.target.value);
            setCopied(false);
            setCopyError(false);
          }}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={BUILDER_MAX_LENGTH + 4}
          placeholder="e.g. FAMILY"
          className="mt-2 w-full rounded-md border-2 border-[var(--panel-border)] bg-[var(--panel)] px-4 py-3 font-display text-2xl font-semibold tracking-[0.2em] text-[var(--ink)] uppercase outline-none placeholder:tracking-normal placeholder:text-[var(--ink-muted)] focus:border-[var(--accent-brand)]"
          aria-describedby="builder-length-hint"
        />
      </label>
      <p
        id="builder-length-hint"
        className={`mt-2 text-sm ${encoded.ok || !normalized ? "text-[var(--ink-muted)]" : "text-[var(--tile-present)]"}`}
        role="status"
      >
        {lengthHint}
      </p>

      {encoded.ok ? (
        <div className="mt-6 space-y-3">
          <p className="text-xs font-semibold tracking-wide text-[var(--ink-muted)] uppercase">
            Share link
          </p>
          <div className="break-all rounded-md border border-[var(--panel-border)] bg-[var(--panel)] px-3 py-3 font-mono text-xs text-[var(--ink)]">
            {shareUrl}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => void onCopy()}
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md bg-[var(--accent-brand)] px-4 text-sm font-bold tracking-wide text-white uppercase transition hover:brightness-110 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-brand)]"
              style={{ touchAction: "manipulation" }}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden />
              ) : (
                <Copy className="h-4 w-4" aria-hidden />
              )}
              {copied ? "Copied" : "Copy link"}
            </button>
            <Link
              to={builderPlayPath(encoded.code)}
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md border-2 border-[var(--accent-brand)] px-4 text-sm font-bold tracking-wide text-[var(--accent-brand)] uppercase transition hover:bg-[var(--accent-brand)]/10 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-brand)]"
              style={{ touchAction: "manipulation" }}
            >
              <Play className="h-4 w-4" aria-hidden />
              Play
            </Link>
          </div>
          {copyError ? (
            <p className="text-sm text-[var(--tile-present)]" role="alert">
              Could not copy — select the link and copy manually.
            </p>
          ) : null}
        </div>
      ) : null}

      <p className="mt-10 text-xs text-[var(--ink-muted)]">
        Links encode the answer (lightly obfuscated). Fine for family share —
        not a secret.
      </p>
    </AppShell>
  );
}
