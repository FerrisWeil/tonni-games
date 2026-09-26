import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChartNoAxesColumn, HelpCircle } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Board } from "./board";
import { Keyboard } from "./keyboard";
import { Toast } from "./toast";
import { StatsDialog } from "./stats-dialog";
import { HowToPlayDialog } from "./how-to-play";
import {
  getLocalDateKey,
  getPuzzleNumber,
  getSolutionForDate,
  isValidGuess,
} from "@/lib/daily";
import {
  fetchNytWordlePuzzle,
  resolveArchiveDateKey,
  resolveWordleSource,
} from "@/lib/nyt-wordle";
import { buildKeyboardStates } from "@/lib/evaluate";
import {
  loadGame,
  loadStats,
  recordFinishedGame,
  saveGame,
} from "@/lib/storage";
import {
  MAX_GUESSES,
  WORD_LENGTH,
  type DailyGameState,
  type GameStatus,
  type Stats,
} from "@/lib/types";

const REVEAL_STAGGER_MS = 220;
const REVEAL_FLIP_MS = 420;
const REVEAL_TOTAL_MS = WORD_LENGTH * REVEAL_STAGGER_MS + REVEAL_FLIP_MS;

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

export function WordleGame() {
  const [hydrated, setHydrated] = useState(false);
  const [dateKey, setDateKey] = useState("");
  const [solution, setSolution] = useState("");
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [status, setStatus] = useState<GameStatus>("playing");
  const [stats, setStats] = useState<Stats>(() => loadStats());
  const [toast, setToast] = useState<string | null>(null);
  const [shakeRow, setShakeRow] = useState(false);
  const [revealingRow, setRevealingRow] = useState<number | null>(null);
  const [statsOpen, setStatsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [sourceLabel, setSourceLabel] = useState<"local" | "nyt">("local");
  const [statusAnn, setStatusAnn] = useState("");
  const revealingRef = useRef(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentGuessRef = useRef("");

  useEffect(() => {
    currentGuessRef.current = currentGuess;
  }, [currentGuess]);

  useEffect(() => {
    let cancelled = false;
    let openStatsTimer: ReturnType<typeof setTimeout> | null = null;

    const showToastLocal = (message: string, ms = 1600) => {
      setToast(message);
      setStatusAnn(message);
      if (toastTimer.current) clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setToast(null), ms);
    };

    async function hydrate() {
      const localKey = getLocalDateKey();
      const source = resolveWordleSource();
      let key = localKey;
      let sol = getSolutionForDate(localKey);
      let used: "local" | "nyt" = "local";

      if (source === "nyt") {
        const archiveKey = resolveArchiveDateKey(
          window.location.search,
          localKey,
        );
        try {
          const puzzle = await fetchNytWordlePuzzle(archiveKey);
          if (cancelled) return;
          key = puzzle.printDate;
          sol = puzzle.solution;
          used = "nyt";
        } catch {
          if (cancelled) return;
          showToastLocal("NYT source unavailable — using Tonni list", 2800);
        }
      }

      if (cancelled) return;
      const saved = loadGame(key);
      setDateKey(key);
      setSolution(sol);
      setSourceLabel(used);
      setGuesses(saved.guesses);
      setCurrentGuess(saved.currentGuess);
      currentGuessRef.current = saved.currentGuess;
      setStatus(saved.status);
      setStats(loadStats());
      setHydrated(true);
      if (saved.status !== "playing") {
        openStatsTimer = setTimeout(() => setStatsOpen(true), 400);
      }
    }

    void hydrate();
    return () => {
      cancelled = true;
      if (openStatsTimer) clearTimeout(openStatsTimer);
    };
  }, []);

  const showToast = useCallback((message: string, ms = 1400) => {
    setToast(message);
    setStatusAnn(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), ms);
  }, []);

  const persist = useCallback(
    (next: Partial<DailyGameState>) => {
      const state: DailyGameState = {
        dateKey,
        guesses: next.guesses ?? guesses,
        status: next.status ?? status,
        currentGuess: next.currentGuess ?? currentGuess,
      };
      saveGame(state);
    },
    [dateKey, guesses, status, currentGuess],
  );

  const finishGame = useCallback(
    (nextGuesses: string[], nextStatus: Exclude<GameStatus, "playing">) => {
      setStatus(nextStatus);
      persist({ guesses: nextGuesses, status: nextStatus, currentGuess: "" });
      const updated = recordFinishedGame(
        loadStats(),
        dateKey,
        nextStatus,
        nextGuesses.length,
      );
      setStats(updated);
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
      const statsMs = prefersReducedMotion() ? 500 : 2000;
      setTimeout(() => setStatsOpen(true), juiceMs + statsMs);
    },
    [dateKey, persist, showToast, solution],
  );

  const submitGuess = useCallback(() => {
    if (status !== "playing" || revealingRef.current) return;
    const guessNow = currentGuessRef.current;
    if (guessNow.length < WORD_LENGTH) {
      showToast("Not enough letters");
      setShakeRow(true);
      setTimeout(() => setShakeRow(false), prefersReducedMotion() ? 0 : 450);
      return;
    }
    if (!isValidGuess(guessNow)) {
      showToast("Not in word list");
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

    const revealMs = prefersReducedMotion() ? 80 : REVEAL_TOTAL_MS;
    setTimeout(() => {
      setRevealingRow(null);
      revealingRef.current = false;
      if (guess === solution) {
        finishGame(nextGuesses, "won");
      } else if (nextGuesses.length >= MAX_GUESSES) {
        finishGame(nextGuesses, "lost");
      }
    }, revealMs);
  }, [status, guesses, persist, showToast, solution, finishGame]);

  const onKey = useCallback(
    (key: string) => {
      if (!hydrated || status !== "playing" || revealingRef.current) return;
      if (statsOpen || helpOpen) return;
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
        if (g.length >= WORD_LENGTH) return;
        const next = g + key;
        currentGuessRef.current = next;
        setCurrentGuess(next);
        persist({ currentGuess: next });
      }
    },
    [hydrated, status, submitGuess, persist, statsOpen, helpOpen],
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (statsOpen || helpOpen) return;
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
  }, [onKey, statsOpen, helpOpen]);

  const letterStates =
    hydrated && solution ? buildKeyboardStates(guesses, solution) : {};

  if (!hydrated) {
    return (
      <div
        className="flex flex-1 items-center justify-center text-[var(--ink-muted)]"
        role="status"
        aria-live="polite"
      >
        Loading today&apos;s puzzle…
      </div>
    );
  }

  return (
    <div className="relative flex min-h-dvh flex-1 flex-col overflow-x-hidden">
      <a href="#wordle-board" className="skip-link">
        Skip to board
      </a>

      <header className="flex items-center justify-between border-b border-[var(--panel-border)] px-2 pt-[max(0.5rem,env(safe-area-inset-top))] pb-2 sm:px-5 sm:py-2.5">
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
            Wordle · #{getPuzzleNumber(dateKey)}
            {sourceLabel === "nyt" ? " · test source" : ""}
          </p>
        </div>

        <div className="flex items-center gap-0.5">
          <ThemeToggle />
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-md text-[var(--ink-muted)] hover:bg-[var(--key-bg)] hover:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-brand)]"
            onClick={() => setStatsOpen(true)}
            aria-label="Statistics"
          >
            <ChartNoAxesColumn className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </header>

      <Toast message={toast} />
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {statusAnn}
      </div>

      <main className="flex min-h-0 flex-1 flex-col items-center justify-between gap-2 px-1 py-2 sm:gap-4 sm:px-2 sm:py-6">
        <div
          id="wordle-board"
          className="flex min-h-0 w-full flex-1 items-center justify-center overflow-x-hidden overflow-y-auto"
          tabIndex={-1}
        >
          <Board
            guesses={guesses}
            currentGuess={currentGuess}
            solution={solution}
            revealingRow={revealingRow}
            shakeRow={shakeRow}
          />
        </div>

        <div className="w-full shrink-0 pb-[max(0.35rem,env(safe-area-inset-bottom))]">
          <Keyboard
            letterStates={letterStates}
            onKey={onKey}
            disabled={status !== "playing" || revealingRow !== null}
          />
        </div>
      </main>

      <StatsDialog
        open={statsOpen}
        onOpenChange={setStatsOpen}
        stats={stats}
        status={status}
        solution={status !== "playing" ? solution : undefined}
        guesses={guesses}
        puzzleNumber={getPuzzleNumber(dateKey)}
      />
      <HowToPlayDialog open={helpOpen} onOpenChange={setHelpOpen} />
    </div>
  );
}
