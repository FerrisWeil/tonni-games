import { useCallback, useEffect, useRef, useState } from "react";
import { ChartNoAxesColumn, HelpCircle } from "lucide-react";
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
  const revealingRef = useRef(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const key = getLocalDateKey();
    const sol = getSolutionForDate(key);
    const saved = loadGame(key);
    setDateKey(key);
    setSolution(sol);
    setGuesses(saved.guesses);
    setCurrentGuess(saved.currentGuess);
    setStatus(saved.status);
    setStats(loadStats());
    setHydrated(true);
    if (saved.status !== "playing") {
      const t = setTimeout(() => setStatsOpen(true), 400);
      return () => clearTimeout(t);
    }
  }, []);

  const showToast = useCallback((message: string, ms = 1600) => {
    setToast(message);
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
      setTimeout(() => {
        if (nextStatus === "won") showToast("Magnificent!", 2000);
        else showToast(solution.toUpperCase(), 2500);
        setStatsOpen(true);
      }, 1600);
    },
    [dateKey, persist, showToast, solution],
  );

  const submitGuess = useCallback(() => {
    if (status !== "playing" || revealingRef.current) return;
    if (currentGuess.length < WORD_LENGTH) {
      showToast("Not enough letters");
      setShakeRow(true);
      setTimeout(() => setShakeRow(false), 500);
      return;
    }
    if (!isValidGuess(currentGuess)) {
      showToast("Not in word list");
      setShakeRow(true);
      setTimeout(() => setShakeRow(false), 500);
      return;
    }

    const guess = currentGuess;
    const nextGuesses = [...guesses, guess];
    revealingRef.current = true;
    setRevealingRow(guesses.length);
    setGuesses(nextGuesses);
    setCurrentGuess("");
    persist({ guesses: nextGuesses, currentGuess: "" });

    const revealMs = 5 * 300 + 200;
    setTimeout(() => {
      setRevealingRow(null);
      revealingRef.current = false;
      if (guess === solution) {
        finishGame(nextGuesses, "won");
      } else if (nextGuesses.length >= MAX_GUESSES) {
        finishGame(nextGuesses, "lost");
      }
    }, revealMs);
  }, [status, currentGuess, guesses, persist, showToast, solution, finishGame]);

  const onKey = useCallback(
    (key: string) => {
      if (!hydrated || status !== "playing" || revealingRef.current) return;
      if (key === "enter") {
        submitGuess();
        return;
      }
      if (key === "backspace") {
        setCurrentGuess((g) => {
          const next = g.slice(0, -1);
          persist({ currentGuess: next });
          return next;
        });
        return;
      }
      if (/^[a-z]$/.test(key) && currentGuess.length < WORD_LENGTH) {
        setCurrentGuess((g) => {
          const next = g + key;
          persist({ currentGuess: next });
          return next;
        });
      }
    },
    [hydrated, status, submitGuess, currentGuess.length, persist],
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
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
  }, [onKey]);

  const letterStates =
    hydrated && solution ? buildKeyboardStates(guesses, solution) : {};

  if (!hydrated) {
    return (
      <div className="flex flex-1 items-center justify-center text-[var(--ink-muted)]">
        Loading today&apos;s puzzle…
      </div>
    );
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-[var(--panel-border)] px-3 py-2.5 sm:px-5">
        <button
          type="button"
          className="rounded-md p-2 text-[var(--ink-muted)] hover:bg-[var(--key-bg)] hover:text-[var(--ink)]"
          onClick={() => setHelpOpen(true)}
          aria-label="How to play"
        >
          <HelpCircle className="h-5 w-5" />
        </button>

        <div className="text-center">
          <p className="font-display text-2xl leading-none font-semibold tracking-tight text-[var(--ink)] sm:text-3xl">
            Tonni Games
          </p>
          <p className="mt-0.5 text-[10px] font-semibold tracking-[0.2em] text-[var(--accent-brand)] uppercase">
            Wordle · #{getPuzzleNumber(dateKey)}
          </p>
        </div>

        <button
          type="button"
          className="rounded-md p-2 text-[var(--ink-muted)] hover:bg-[var(--key-bg)] hover:text-[var(--ink)]"
          onClick={() => setStatsOpen(true)}
          aria-label="Statistics"
        >
          <ChartNoAxesColumn className="h-5 w-5" />
        </button>
      </header>

      <Toast message={toast} />

      <main className="flex min-h-0 flex-1 flex-col items-center justify-between gap-4 px-2 py-4 sm:py-6">
        <div className="flex flex-1 items-center">
          <Board
            guesses={guesses}
            currentGuess={currentGuess}
            solution={solution}
            revealingRow={revealingRow}
            shakeRow={shakeRow}
          />
        </div>

        <div className="w-full pb-[max(0.5rem,env(safe-area-inset-bottom))]">
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
        solution={status === "lost" ? solution : undefined}
      />
      <HowToPlayDialog open={helpOpen} onOpenChange={setHelpOpen} />
    </div>
  );
}
