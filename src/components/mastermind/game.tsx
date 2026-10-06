import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Delete, HelpCircle, RotateCcw } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ThemeToggle } from "@/components/theme-toggle";
import { Toast } from "@/components/wordle/toast";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import {
  emptyCurrentPegs,
  evaluateGuess,
  generateSecret,
  isGuessComplete,
  isWinningFeedback,
} from "@/lib/mastermind/logic";
import {
  clearMastermindState,
  loadMastermindState,
  saveMastermindState,
} from "@/lib/mastermind/storage";
import { mmPegVar } from "@/lib/mastermind/theme-tokens";
import {
  DIFFICULTIES,
  DIFFICULTY_ORDER,
  PEG_LABELS,
  type Difficulty,
  type GuessRow,
  type MastermindStatus,
  type PegColor,
} from "@/lib/mastermind/types";

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

function FeedbackKeys({
  exact,
  near,
  codeLength,
}: {
  exact: number;
  near: number;
  codeLength: number;
}) {
  const keys: Array<"exact" | "near" | "empty"> = [];
  for (let i = 0; i < exact; i++) keys.push("exact");
  for (let i = 0; i < near; i++) keys.push("near");
  while (keys.length < codeLength) keys.push("empty");

  return (
    <div
      className="grid grid-cols-2 gap-1"
      aria-label={`${exact} exact, ${near} near`}
      title={`${exact} exact · ${near} near`}
    >
      {keys.map((kind, i) => (
        <span
          key={i}
          className={cn(
            "mm-key",
            kind === "exact" && "mm-key-exact",
            kind === "near" && "mm-key-near",
          )}
          aria-hidden
        />
      ))}
    </div>
  );
}

function Peg({
  color,
  label,
  selected,
  onClick,
  disabled,
  sizeClass,
}: {
  color: PegColor | null;
  label?: string;
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  sizeClass?: string;
}) {
  const filled = color !== null;
  const name = filled ? PEG_LABELS[color]! : "Empty";
  const Tag = onClick ? "button" : "span";

  return (
    <Tag
      type={onClick ? "button" : undefined}
      className={cn(
        "mm-peg",
        sizeClass,
        filled ? "mm-peg-filled" : "mm-peg-empty",
        selected && "mm-peg-selected",
        prefersReducedMotion() ? undefined : filled && "mm-pop",
      )}
      style={filled ? { background: mmPegVar(color) } : undefined}
      aria-label={label ?? name}
      disabled={disabled}
      onClick={onClick}
    />
  );
}

export function MastermindGame() {
  const [phase, setPhase] = useState<"pick" | "play">("pick");
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [secret, setSecret] = useState<PegColor[]>([]);
  const [guesses, setGuesses] = useState<GuessRow[]>([]);
  const [currentPegs, setCurrentPegs] = useState<(PegColor | null)[]>([]);
  const [activeSlot, setActiveSlot] = useState(0);
  const [status, setStatus] = useState<MastermindStatus>("playing");
  const [toast, setToast] = useState<string | null>(null);
  const [statusAnn, setStatusAnn] = useState("");
  const [helpOpen, setHelpOpen] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const boardEndRef = useRef<HTMLDivElement>(null);

  const cfg = difficulty ? DIFFICULTIES[difficulty] : null;

  const showToast = useCallback((message: string, ms = 1600) => {
    setToast(message);
    setStatusAnn(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), ms);
  }, []);

  const persist = useCallback(
    (next: {
      difficulty: Difficulty;
      secret: PegColor[];
      guesses: GuessRow[];
      currentPegs: (PegColor | null)[];
      status: MastermindStatus;
    }) => {
      saveMastermindState(next);
    },
    [],
  );

  const startFresh = useCallback(
    (diff: Difficulty) => {
      const nextSecret = generateSecret(diff);
      const empty = emptyCurrentPegs(DIFFICULTIES[diff].codeLength);
      setDifficulty(diff);
      setSecret(nextSecret);
      setGuesses([]);
      setCurrentPegs(empty);
      setActiveSlot(0);
      setStatus("playing");
      setPhase("play");
      setResultOpen(false);
      clearMastermindState(diff);
      persist({
        difficulty: diff,
        secret: nextSecret,
        guesses: [],
        currentPegs: empty,
        status: "playing",
      });
      setStatusAnn(`Started ${DIFFICULTIES[diff].label} Mastermind`);
    },
    [persist],
  );

  const resumeOrStart = useCallback(
    (diff: Difficulty) => {
      const saved = loadMastermindState(diff);
      if (saved && saved.status === "playing") {
        setDifficulty(diff);
        setSecret(saved.secret);
        setGuesses(saved.guesses);
        setCurrentPegs(saved.currentPegs);
        setActiveSlot(
          Math.max(
            0,
            saved.currentPegs.findIndex((p) => p === null),
          ),
        );
        setStatus("playing");
        setPhase("play");
        setStatusAnn(`Resumed ${DIFFICULTIES[diff].label} game`);
        return;
      }
      startFresh(diff);
    },
    [startFresh],
  );

  useEffect(() => {
    if (phase !== "play") return;
    boardEndRef.current?.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "nearest",
    });
  }, [guesses.length, phase]);

  const guessesLeft = cfg ? cfg.maxGuesses - guesses.length : 0;

  const placeColor = useCallback(
    (color: PegColor) => {
      if (!cfg || status !== "playing" || !difficulty) return;
      setCurrentPegs((prev) => {
        const next = [...prev];
        const slot =
          next[activeSlot] === null
            ? activeSlot
            : next.findIndex((p) => p === null);
        const target = slot === -1 ? activeSlot : slot;
        next[target] = color;
        const following = next.findIndex((p, i) => i > target && p === null);
        setActiveSlot(following === -1 ? Math.min(target + 1, cfg.codeLength - 1) : following);
        persist({
          difficulty,
          secret,
          guesses,
          currentPegs: next,
          status,
        });
        return next;
      });
    },
    [activeSlot, cfg, difficulty, guesses, persist, secret, status],
  );

  const clearSlot = useCallback(() => {
    if (!cfg || status !== "playing" || !difficulty) return;
    setCurrentPegs((prev) => {
      const next = [...prev];
      let target = activeSlot;
      if (next[target] === null) {
        for (let i = target - 1; i >= 0; i--) {
          if (next[i] !== null) {
            target = i;
            break;
          }
        }
      }
      next[target] = null;
      setActiveSlot(target);
      persist({
        difficulty,
        secret,
        guesses,
        currentPegs: next,
        status,
      });
      return next;
    });
  }, [activeSlot, cfg, difficulty, guesses, persist, secret, status]);

  const submitGuess = useCallback(() => {
    if (!cfg || !difficulty || status !== "playing") return;
    if (!isGuessComplete(currentPegs)) {
      showToast("Fill every peg");
      return;
    }

    const feedback = evaluateGuess(currentPegs, secret);
    const row: GuessRow = { pegs: [...currentPegs], feedback };
    const nextGuesses = [...guesses, row];
    const won = isWinningFeedback(feedback, cfg.codeLength);
    const lost = !won && nextGuesses.length >= cfg.maxGuesses;
    const nextStatus: MastermindStatus = won
      ? "won"
      : lost
        ? "lost"
        : "playing";
    const nextCurrent =
      nextStatus === "playing"
        ? emptyCurrentPegs(cfg.codeLength)
        : currentPegs;

    setGuesses(nextGuesses);
    setCurrentPegs(nextCurrent);
    setActiveSlot(0);
    setStatus(nextStatus);
    persist({
      difficulty,
      secret,
      guesses: nextGuesses,
      currentPegs: nextCurrent,
      status: nextStatus,
    });

    const ann = won
      ? `You cracked the code in ${nextGuesses.length} guesses`
      : lost
        ? "Out of guesses — code revealed"
        : `${feedback.exact} exact, ${feedback.near} near. ${cfg.maxGuesses - nextGuesses.length} left`;
    setStatusAnn(ann);
    if (won || lost) {
      setTimeout(() => setResultOpen(true), 280);
    }
  }, [
    cfg,
    currentPegs,
    difficulty,
    guesses,
    persist,
    secret,
    showToast,
    status,
  ]);

  const palette = useMemo(() => {
    if (!cfg) return [];
    return Array.from({ length: cfg.colorCount }, (_, i) => i);
  }, [cfg]);

  if (phase === "pick" || !cfg || !difficulty) {
    return (
      <AppShell
        header={
          <>
            <Link
              to="/"
              className="inline-flex min-h-11 items-center px-2 text-sm font-medium text-[var(--ink-muted)] hover:text-[var(--ink)]"
            >
              Home
            </Link>
            <h1 className="font-display absolute left-1/2 -translate-x-1/2 text-xl font-semibold tracking-tight text-[var(--ink)] sm:text-2xl">
              Mastermind
            </h1>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-md text-[var(--ink-muted)] hover:bg-[var(--key-bg)] hover:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-brand)]"
                aria-label="How to play"
                onClick={() => setHelpOpen(true)}
              >
                <HelpCircle className="h-5 w-5" aria-hidden />
              </button>
              <ThemeToggle />
            </div>
          </>
        }
        headerClassName="relative flex items-center justify-between px-2 py-1.5"
      >
        <div className="flex flex-col gap-4 px-4 py-6">
          <div>
            <h2 className="font-display text-2xl font-semibold text-[var(--ink)]">
              Choose difficulty
            </h2>
            <p className="mt-1 text-sm text-[var(--ink-muted)]">
              Crack the secret color code. Exact and near keys tell you how
              close each guess is.
            </p>
          </div>
          <div className="flex flex-col gap-3" role="list">
            {DIFFICULTY_ORDER.map((id) => {
              const d = DIFFICULTIES[id];
              const saved = loadMastermindState(id);
              const canResume = saved?.status === "playing";
              return (
                <button
                  key={id}
                  type="button"
                  className="mm-diff-card"
                  role="listitem"
                  onClick={() => resumeOrStart(id)}
                >
                  <span className="text-base font-bold tracking-wide text-[var(--ink)] uppercase">
                    {d.label}
                  </span>
                  <span className="text-sm text-[var(--ink-muted)]">
                    {d.blurb}
                  </span>
                  {canResume ? (
                    <span className="mt-1 text-xs font-semibold text-[var(--accent-brand)]">
                      Resume in progress
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
        <HowToPlayMastermind open={helpOpen} onOpenChange={setHelpOpen} />
      </AppShell>
    );
  }

  return (
    <>
      <AppShell
        header={
          <>
            <button
              type="button"
              className="inline-flex min-h-11 items-center px-2 text-sm font-medium text-[var(--ink-muted)] hover:text-[var(--ink)]"
              onClick={() => {
                setPhase("pick");
                setDifficulty(null);
              }}
            >
              Difficulty
            </button>
            <h1 className="font-display absolute left-1/2 -translate-x-1/2 text-xl font-semibold tracking-tight text-[var(--ink)] sm:text-2xl">
              Mastermind
            </h1>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-md text-[var(--ink-muted)] hover:bg-[var(--key-bg)] hover:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-brand)]"
                aria-label="How to play"
                onClick={() => setHelpOpen(true)}
              >
                <HelpCircle className="h-5 w-5" aria-hidden />
              </button>
              <ThemeToggle />
            </div>
          </>
        }
        headerClassName="relative flex items-center justify-between px-2 py-1.5"
        footer={
          status === "playing" ? (
            <div className="border-t border-[var(--panel-border)] bg-[var(--panel)] px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <div
                className="flex flex-wrap items-center justify-center gap-2"
                role="group"
                aria-label="Color palette"
              >
                {palette.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="mm-palette-btn"
                    style={{ background: mmPegVar(color) }}
                    aria-label={PEG_LABELS[color]}
                    onClick={() => placeColor(color)}
                  />
                ))}
                <button
                  type="button"
                  className="inline-flex h-11 min-w-11 items-center justify-center rounded-md border border-[var(--panel-border)] bg-[var(--key-bg)] text-[var(--ink)]"
                  aria-label="Clear last peg"
                  onClick={clearSlot}
                  style={{ touchAction: "manipulation" }}
                >
                  <Delete className="h-5 w-5" aria-hidden />
                </button>
              </div>
              <button
                type="button"
                className="conn-btn conn-btn-primary mt-2 w-full"
                onClick={submitGuess}
                disabled={!isGuessComplete(currentPegs)}
              >
                Check guess
              </button>
            </div>
          ) : (
            <div className="border-t border-[var(--panel-border)] bg-[var(--panel)] px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <button
                type="button"
                className="conn-btn conn-btn-primary inline-flex w-full items-center justify-center gap-2"
                onClick={() => startFresh(difficulty)}
              >
                <RotateCcw className="h-4 w-4" aria-hidden />
                Play again
              </button>
            </div>
          )
        }
      >
        <div className="relative flex flex-col gap-3 px-4 py-3">
          <Toast message={toast} />
          <div
            className="sr-only"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {statusAnn}
          </div>

          <div className="flex items-center justify-between text-sm text-[var(--ink-muted)]">
            <span className="font-semibold text-[var(--ink)]">
              {cfg.label}
            </span>
            <span aria-live="polite">
              {status === "playing"
                ? `${guessesLeft} guess${guessesLeft === 1 ? "" : "es"} left`
                : status === "won"
                  ? "Solved"
                  : "Out of guesses"}
            </span>
          </div>

          <p className="text-center text-xs text-[var(--ink-muted)]">
            Solid key = exact position · Ring key = right color, wrong spot
          </p>

          <div
            className="flex flex-col gap-2"
            role="list"
            aria-label="Guess board"
          >
            {guesses.map((row, rowIndex) => (
              <div
                key={rowIndex}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-lg bg-[var(--panel)]/60 px-2 py-2",
                  !prefersReducedMotion() && "mm-row-in",
                )}
                role="listitem"
                aria-label={`Guess ${rowIndex + 1}: ${row.feedback.exact} exact, ${row.feedback.near} near`}
              >
                <div className="flex gap-2">
                  {row.pegs.map((color, i) => (
                    <Peg key={i} color={color} />
                  ))}
                </div>
                <FeedbackKeys
                  exact={row.feedback.exact}
                  near={row.feedback.near}
                  codeLength={cfg.codeLength}
                />
              </div>
            ))}

            {status === "playing" ? (
              <div
                className="flex items-center justify-between gap-3 rounded-lg border border-dashed border-[var(--panel-border)] px-2 py-2"
                role="listitem"
                aria-label="Current guess"
              >
                <div className="flex gap-2">
                  {currentPegs.map((color, i) => (
                    <Peg
                      key={i}
                      color={color}
                      selected={activeSlot === i}
                      label={`Slot ${i + 1}${color !== null ? `, ${PEG_LABELS[color]}` : ", empty"}`}
                      onClick={() => setActiveSlot(i)}
                    />
                  ))}
                </div>
                <div
                  className="grid grid-cols-2 gap-1 opacity-30"
                  aria-hidden
                >
                  {Array.from({ length: cfg.codeLength }).map((_, i) => (
                    <span key={i} className="mm-key" />
                  ))}
                </div>
              </div>
            ) : null}

            {status === "lost" ? (
              <div
                className="flex items-center justify-between gap-3 rounded-lg border border-[var(--accent-brand)] bg-[var(--panel)] px-2 py-2"
                aria-label="Secret code"
              >
                <div className="flex gap-2">
                  {secret.map((color, i) => (
                    <Peg key={i} color={color} />
                  ))}
                </div>
                <span className="text-xs font-semibold tracking-wide text-[var(--ink-muted)] uppercase">
                  Code
                </span>
              </div>
            ) : null}

            <div ref={boardEndRef} />
          </div>
        </div>
      </AppShell>

      <HowToPlayMastermind open={helpOpen} onOpenChange={setHelpOpen} />
      <ResultDialog
        open={resultOpen}
        onOpenChange={setResultOpen}
        status={status}
        guessCount={guesses.length}
        maxGuesses={cfg.maxGuesses}
        secret={secret}
        onAgain={() => startFresh(difficulty)}
        onChangeDifficulty={() => {
          setResultOpen(false);
          setPhase("pick");
          setDifficulty(null);
        }}
      />
    </>
  );
}

function HowToPlayMastermind({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="How to play Mastermind"
      description="Crack the secret color code."
    >
      <div className="space-y-3 text-sm text-[var(--ink)]">
        <p>
          Pick a difficulty, then guess the hidden row of colored pegs within
          the guess limit.
        </p>
        <ul className="list-disc space-y-1 pl-5 text-[var(--ink-muted)]">
          <li>
            <strong className="text-[var(--ink)]">Exact</strong> (solid key) —
            right color in the right spot.
          </li>
          <li>
            <strong className="text-[var(--ink)]">Near</strong> (ring key) —
            right color, wrong spot.
          </li>
          <li>Keys are counts only — they are not lined up with pegs.</li>
          <li>
            Easy has no duplicate colors; Medium and Hard allow duplicates.
          </li>
        </ul>
      </div>
    </Modal>
  );
}

function ResultDialog({
  open,
  onOpenChange,
  status,
  guessCount,
  maxGuesses,
  secret,
  onAgain,
  onChangeDifficulty,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  status: MastermindStatus;
  guessCount: number;
  maxGuesses: number;
  secret: PegColor[];
  onAgain: () => void;
  onChangeDifficulty: () => void;
}) {
  if (status === "playing") return null;
  const won = status === "won";

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={won ? "You cracked it!" : "Out of guesses"}
      description={
        won
          ? `Solved in ${guessCount} of ${maxGuesses} guesses.`
          : "Here is the secret code."
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex justify-center gap-2" aria-label="Secret code">
          {secret.map((color, i) => (
            <Peg key={i} color={color} />
          ))}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            className="conn-btn conn-btn-primary flex-1"
            onClick={onAgain}
          >
            Play again
          </button>
          <button
            type="button"
            className="conn-btn flex-1"
            onClick={onChangeDifficulty}
          >
            Change difficulty
          </button>
        </div>
      </div>
    </Modal>
  );
}
