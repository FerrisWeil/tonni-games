import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { HelpCircle, Share2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ThemeToggle } from "@/components/theme-toggle";
import { Board } from "./board";
import { Keyboard } from "./keyboard";
import { Toast } from "./toast";
import { HowToPlayDialog } from "./how-to-play";
import { Modal } from "@/components/ui/modal";
import { isValidGuess } from "@/lib/daily";
import { buildKeyboardStates } from "@/lib/evaluate";
import { copyShareText } from "@/lib/share";
import {
  loadCustomGame,
  saveCustomGame,
} from "@/lib/wordle-builder-storage";
import {
  builderPlayPath,
  maxGuessesForLength,
} from "@/lib/wordle-builder";
import type { GameStatus } from "@/lib/types";

const REVEAL_STAGGER_MS = 220;
const REVEAL_FLIP_MS = 420;

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

function isAllowedCustomGuess(guess: string, wordLength: number): boolean {
  if (guess.length !== wordLength) return false;
  if (!/^[a-z]+$/.test(guess)) return false;
  if (wordLength === 5) return isValidGuess(guess);
  return true;
}

interface CustomWordleGameProps {
  code: string;
  solution: string;
}

export function CustomWordleGame({ code, solution }: CustomWordleGameProps) {
  const wordLength = solution.length;
  const maxGuesses = maxGuessesForLength(wordLength);
  const revealTotalMs = wordLength * REVEAL_STAGGER_MS + REVEAL_FLIP_MS;

  const [guesses, setGuesses] = useState(() => loadCustomGame(code).guesses);
  const [currentGuess, setCurrentGuess] = useState(
    () => loadCustomGame(code).currentGuess,
  );
  const [status, setStatus] = useState<GameStatus>(
    () => loadCustomGame(code).status,
  );
  const [toast, setToast] = useState<string | null>(null);
  const [shakeRow, setShakeRow] = useState(false);
  const [revealingRow, setRevealingRow] = useState<number | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);
  const [statusAnn, setStatusAnn] = useState("");
  const revealingRef = useRef(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentGuessRef = useRef(loadCustomGame(code).currentGuess);

  useEffect(() => {
    currentGuessRef.current = currentGuess;
  }, [currentGuess]);

  useEffect(() => {
    if (loadCustomGame(code).status === "playing") return;
    const t = setTimeout(() => setResultOpen(true), 400);
    return () => clearTimeout(t);
  }, [code]);

  const showToast = useCallback((message: string, ms = 1400) => {
    setToast(message);
    setStatusAnn(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), ms);
  }, []);

  const persist = useCallback(
    (next: {
      guesses?: string[];
      status?: GameStatus;
      currentGuess?: string;
    }) => {
      saveCustomGame({
        code,
        guesses: next.guesses ?? guesses,
        status: next.status ?? status,
        currentGuess: next.currentGuess ?? currentGuess,
      });
    },
    [code, guesses, status, currentGuess],
  );

  const finishGame = useCallback(
    (nextGuesses: string[], nextStatus: Exclude<GameStatus, "playing">) => {
      setStatus(nextStatus);
      persist({ guesses: nextGuesses, status: nextStatus, currentGuess: "" });
      const juiceMs = prefersReducedMotion() ? 120 : 700;
      setTimeout(() => {
        if (nextStatus === "won") {
          showToast("Magnificent!", 2000);
          setStatusAnn(`You won in ${nextGuesses.length} guesses.`);
        } else {
          showToast(solution.toUpperCase(), 2500);
          setStatusAnn(`The word was ${solution.toUpperCase()}.`);
        }
      }, juiceMs);
      const resultMs = prefersReducedMotion() ? 500 : 2000;
      setTimeout(() => setResultOpen(true), juiceMs + resultMs);
    },
    [persist, showToast, solution],
  );

  const submitGuess = useCallback(() => {
    if (status !== "playing" || revealingRef.current) return;
    const guessNow = currentGuessRef.current;
    if (guessNow.length < wordLength) {
      showToast("Not enough letters");
      setShakeRow(true);
      setTimeout(() => setShakeRow(false), prefersReducedMotion() ? 0 : 450);
      return;
    }
    if (!isAllowedCustomGuess(guessNow, wordLength)) {
      showToast(wordLength === 5 ? "Not in word list" : "Letters only");
      setShakeRow(true);
      setTimeout(() => setShakeRow(false), prefersReducedMotion() ? 0 : 450);
      return;
    }

    const guess = guessNow;
    const nextGuesses = [...guesses, guess];
    revealingRef.current = true;
    setRevealingRow(guesses.length);
    setGuesses(nextGuesses);
    setCurrentGuess("");
    currentGuessRef.current = "";
    persist({ guesses: nextGuesses, currentGuess: "" });
    setStatusAnn(`Guess ${nextGuesses.length}: ${guess.toUpperCase()}`);

    const revealMs = prefersReducedMotion() ? 80 : revealTotalMs;
    setTimeout(() => {
      setRevealingRow(null);
      revealingRef.current = false;
      if (guess === solution) {
        finishGame(nextGuesses, "won");
      } else if (nextGuesses.length >= maxGuesses) {
        finishGame(nextGuesses, "lost");
      }
    }, revealMs);
  }, [
    status,
    guesses,
    persist,
    showToast,
    solution,
    finishGame,
    wordLength,
    maxGuesses,
    revealTotalMs,
  ]);

  const onKey = useCallback(
    (key: string) => {
      if (status !== "playing" || revealingRef.current) return;
      if (helpOpen || resultOpen) return;
      if (key === "enter") {
        submitGuess();
        return;
      }
      if (key === "backspace") {
        const next = currentGuessRef.current.slice(0, -1);
        currentGuessRef.current = next;
        setCurrentGuess(next);
        persist({ currentGuess: next });
        return;
      }
      if (/^[a-z]$/.test(key)) {
        const g = currentGuessRef.current;
        if (g.length >= wordLength) return;
        const next = g + key;
        currentGuessRef.current = next;
        setCurrentGuess(next);
        persist({ currentGuess: next });
      }
    },
    [status, submitGuess, persist, helpOpen, resultOpen, wordLength],
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (helpOpen || resultOpen) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        onKey("enter");
      } else if (e.key === "Backspace") {
        e.preventDefault();
        onKey("backspace");
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        onKey(e.key.toLowerCase());
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onKey, helpOpen, resultOpen]);

  const letterStates = useMemo(
    () => (solution ? buildKeyboardStates(guesses, solution) : {}),
    [solution, guesses],
  );

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return builderPlayPath(code);
    return `${window.location.origin}${builderPlayPath(code)}`;
  }, [code]);

  const onShareResult = useCallback(async () => {
    const score = status === "won" ? String(guesses.length) : "X";
    const title = `Tonni Games Custom Wordle ${score}/${maxGuesses}`;
    const text = [title, "", shareUrl].join("\n");
    const ok = await copyShareText(text);
    showToast(ok ? "Result copied" : "Could not copy", 1600);
  }, [status, guesses.length, maxGuesses, shareUrl, showToast]);

  return (
    <>
      <a href="#wordle-board" className="skip-link">
        Skip to board
      </a>
      <AppShell
        headerClassName="flex items-center justify-between px-2 pt-[max(0.5rem,env(safe-area-inset-top))] pb-2 sm:px-5 sm:py-2.5"
        bodyClassName="flex items-center justify-center overflow-y-auto px-1 py-2 sm:px-2 sm:py-4"
        footerClassName="border-t-0 px-1 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1 sm:px-2"
        header={
          <>
            <div className="flex items-center gap-0.5">
              <Link
                to="/"
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md px-2 text-xs font-semibold tracking-wide text-[var(--ink-muted)] uppercase hover:bg-[var(--key-bg)] hover:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-brand)]"
              >
                Home
              </Link>
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-md text-[var(--ink-muted)] hover:bg-[var(--key-bg)] hover:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-brand)]"
                onClick={() => setHelpOpen(true)}
                aria-label="How to play"
              >
                <HelpCircle className="h-5 w-5" aria-hidden />
              </button>
            </div>

            <div className="text-center">
              <p className="font-display text-2xl leading-none font-semibold tracking-tight text-[var(--ink)] sm:text-3xl">
                Tonni Games
              </p>
              <p className="mt-0.5 text-[10px] font-semibold tracking-[0.2em] text-[var(--accent-brand)] uppercase">
                Custom · {wordLength} letters
              </p>
            </div>

            <div className="flex items-center gap-0.5">
              <ThemeToggle />
              <Link
                to="/wordle/builder"
                className="inline-flex h-11 min-w-11 items-center justify-center rounded-md px-2 text-xs font-semibold tracking-wide text-[var(--ink-muted)] uppercase hover:bg-[var(--key-bg)] hover:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-brand)]"
              >
                Build
              </Link>
            </div>
          </>
        }
        footer={
          <Keyboard
            letterStates={letterStates}
            onKey={onKey}
            disabled={status !== "playing" || revealingRow !== null}
          />
        }
      >
        <Toast message={toast} />
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {statusAnn}
        </div>
        <div
          id="wordle-board"
          className="flex w-full items-center justify-center"
          tabIndex={-1}
        >
          <Board
            guesses={guesses}
            currentGuess={currentGuess}
            solution={solution}
            revealingRow={revealingRow}
            shakeRow={shakeRow}
            wordLength={wordLength}
            maxGuesses={maxGuesses}
          />
        </div>
      </AppShell>

      <HowToPlayDialog open={helpOpen} onOpenChange={setHelpOpen} />

      <Modal
        open={resultOpen}
        onOpenChange={setResultOpen}
        title={status === "won" ? "You got it" : "Nice try"}
        description={
          status === "won"
            ? `Solved in ${guesses.length} of ${maxGuesses} guesses.`
            : `The word was ${solution.toUpperCase()}.`
        }
      >
        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => void onShareResult()}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--accent-brand)] px-4 text-sm font-bold tracking-wide text-white uppercase hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-brand)]"
          >
            <Share2 className="h-4 w-4" aria-hidden />
            Share puzzle
          </button>
          <Link
            to="/wordle/builder"
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-[var(--panel-border)] px-4 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--key-bg)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-brand)]"
          >
            Build another
          </Link>
        </div>
      </Modal>
    </>
  );
}
