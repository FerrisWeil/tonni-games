import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { HelpCircle, Share2 } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Toast } from "@/components/wordle/toast";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import { getLocalDateKey } from "@/lib/daily";
import { copyShareText } from "@/lib/share";
import {
  evaluateGuess,
  groupKey,
  normalizeWord,
  remainingWords,
  shuffleWords,
} from "@/lib/connections/logic";
import { loadConnectionsPuzzle } from "@/lib/connections/loader";
import { listTonniPuzzles } from "@/lib/connections/packs";
import { buildConnectionsShare } from "@/lib/connections/share";
import {
  loadConnectionsState,
  saveConnectionsState,
} from "@/lib/connections/storage";
import {
  DIFFICULTY_COLORS,
  DIFFICULTY_LABELS,
  GROUP_SIZE,
  MAX_MISTAKES,
  type ConnectionGroup,
  type ConnectionsGameStatus,
  type ConnectionsPuzzle,
  type ConnectionsSource,
} from "@/lib/connections/types";

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

function mistakesRemainingDots(mistakes: number): boolean[] {
  return Array.from(
    { length: MAX_MISTAKES },
    (_, i) => i < MAX_MISTAKES - mistakes,
  );
}

export function ConnectionsGame() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [hydrated, setHydrated] = useState(false);
  const [puzzle, setPuzzle] = useState<ConnectionsPuzzle | null>(null);
  const [sourceLabel, setSourceLabel] = useState<ConnectionsSource>("tonni");
  const [board, setBoard] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  /** Groups the player solved (never includes auto-reveal on loss). */
  const [solved, setSolved] = useState<ConnectionGroup[]>([]);
  /** Extra groups shown after a loss (for category reveal). */
  const [revealed, setRevealed] = useState<ConnectionGroup[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [status, setStatus] = useState<ConnectionsGameStatus>("playing");
  const [toast, setToast] = useState<string | null>(null);
  const [statusAnn, setStatusAnn] = useState("");
  const [helpOpen, setHelpOpen] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);
  const [shake, setShake] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const foundKeys = useMemo(
    () => new Set(solved.map((g) => groupKey(g))),
    [solved],
  );

  const displayGroups = useMemo(
    () => [...solved, ...revealed],
    [solved, revealed],
  );

  const showToast = useCallback((message: string, ms = 1600) => {
    setToast(message);
    setStatusAnn(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), ms);
  }, []);

  const persist = useCallback(
    (
      next: {
        solved: ConnectionGroup[];
        mistakes: number;
        status: ConnectionsGameStatus;
      },
      currentPuzzle: ConnectionsPuzzle,
    ) => {
      saveConnectionsState({
        puzzleId: currentPuzzle.id,
        foundGroupIds: next.solved.map((g) => groupKey(g)),
        mistakes: next.mistakes,
        status: next.status,
        mistakeRows: [],
      });
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;
    let resultTimer: ReturnType<typeof setTimeout> | null = null;

    async function hydrate() {
      setHydrated(false);
      const result = await loadConnectionsPuzzle({
        search: window.location.search,
      });
      if (cancelled) return;

      const p = result.puzzle;
      setPuzzle(p);
      setSourceLabel(result.source);
      if (result.message) showToast(result.message, 2800);

      const saved = loadConnectionsState(p.id);
      const restored: ConnectionGroup[] = [];
      let nextMistakes = 0;
      let nextStatus: ConnectionsGameStatus = "playing";

      if (saved) {
        for (const id of saved.foundGroupIds) {
          const g = p.groups.find((x) => groupKey(x) === id);
          if (g) restored.push(g);
        }
        nextMistakes = saved.mistakes;
        nextStatus = saved.status;
      }

      setSolved(restored);
      setMistakes(nextMistakes);
      setStatus(nextStatus);
      setSelected([]);
      setRevealed([]);

      const foundSet = new Set(restored.map((g) => groupKey(g)));
      if (nextStatus === "lost") {
        const remaining = p.groups.filter((g) => !foundSet.has(groupKey(g)));
        setRevealed(remaining);
        setBoard([]);
      } else if (nextStatus === "won") {
        setBoard([]);
      } else {
        setBoard(shuffleWords(remainingWords(p, foundSet)));
      }

      setHydrated(true);
      if (nextStatus !== "playing") {
        resultTimer = setTimeout(() => setResultOpen(true), 350);
      }
    }

    void hydrate();
    return () => {
      cancelled = true;
      if (resultTimer) clearTimeout(resultTimer);
    };
  }, [searchParams, showToast]);

  const toggleWord = useCallback(
    (word: string) => {
      if (status !== "playing" || submitting) return;
      const n = normalizeWord(word);
      setSelected((prev) => {
        if (prev.includes(n)) return prev.filter((w) => w !== n);
        if (prev.length >= GROUP_SIZE) {
          showToast("Only 4 words can be selected");
          return prev;
        }
        return [...prev, n];
      });
    },
    [status, submitting, showToast],
  );

  const deselectAll = useCallback(() => setSelected([]), []);

  const shuffleBoard = useCallback(() => {
    if (status !== "playing") return;
    setBoard((prev) => shuffleWords(prev));
    setSelected([]);
  }, [status]);

  const submit = useCallback(() => {
    if (!puzzle || status !== "playing" || submitting) return;
    if (selected.length !== GROUP_SIZE) {
      showToast("Select 4 words");
      return;
    }

    const outcome = evaluateGuess(puzzle, selected, foundKeys);
    if (outcome.kind === "correct") {
      const nextSolved = [...solved, outcome.group];
      const nextKeys = new Set(nextSolved.map((g) => groupKey(g)));
      setSolved(nextSolved);
      setBoard(shuffleWords(remainingWords(puzzle, nextKeys)));
      setSelected([]);
      showToast(outcome.group.title, 2000);
      setStatusAnn(`Correct: ${outcome.group.title}`);

      if (nextSolved.length === 4) {
        setStatus("won");
        persist(
          { solved: nextSolved, mistakes, status: "won" },
          puzzle,
        );
        setTimeout(
          () => setResultOpen(true),
          prefersReducedMotion() ? 200 : 600,
        );
      } else {
        persist(
          { solved: nextSolved, mistakes, status: "playing" },
          puzzle,
        );
      }
      return;
    }

    setSubmitting(true);
    setShake(true);
    const nextMistakes = mistakes + 1;
    setMistakes(nextMistakes);
    showToast(outcome.oneAway ? "One away…" : "Not quite");

    const delay = prefersReducedMotion() ? 120 : 450;
    window.setTimeout(() => {
      setShake(false);
      setSubmitting(false);
      setSelected([]);

      if (nextMistakes >= MAX_MISTAKES) {
        const remaining = puzzle.groups.filter(
          (g) => !foundKeys.has(groupKey(g)),
        );
        setRevealed(remaining);
        setBoard([]);
        setStatus("lost");
        persist(
          { solved, mistakes: nextMistakes, status: "lost" },
          puzzle,
        );
        setTimeout(() => setResultOpen(true), 400);
      } else {
        persist(
          { solved, mistakes: nextMistakes, status: "playing" },
          puzzle,
        );
      }
    }, delay);
  }, [
    puzzle,
    status,
    submitting,
    selected,
    foundKeys,
    solved,
    mistakes,
    showToast,
    persist,
  ]);

  const setSource = useCallback(
    (source: ConnectionsSource) => {
      const next = new URLSearchParams(searchParams);
      next.set("source", source);
      if (source === "tonni") {
        next.delete("date");
      } else if (!next.get("date")) {
        next.set("date", getLocalDateKey());
      }
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const setTonniPuzzle = useCallback(
    (id: string) => {
      const next = new URLSearchParams(searchParams);
      next.set("source", "tonni");
      next.set("puzzle", id);
      next.delete("date");
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const setNytDate = useCallback(
    (date: string) => {
      const next = new URLSearchParams(searchParams);
      next.set("source", "nyt");
      next.set("date", date);
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const share = useCallback(async () => {
    if (!puzzle) return;
    const payload = buildConnectionsShare({
      puzzle,
      foundGroups: solved,
      mistakes,
      won: status === "won",
    });
    const ok = await copyShareText(payload.clipboard);
    showToast(ok ? "Copied results" : "Could not copy");
  }, [puzzle, solved, mistakes, status, showToast]);

  if (!hydrated || !puzzle) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-[var(--ink-muted)]">
        Loading puzzle…
      </div>
    );
  }

  const nytDate = searchParams.get("date") ?? getLocalDateKey();
  const tonniList = listTonniPuzzles();

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(0.25rem,env(safe-area-inset-top))]">
      <a
        href="#connections-board"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-2 focus:rounded focus:bg-[var(--panel)] focus:px-3 focus:py-2"
      >
        Skip to board
      </a>

      <header className="relative flex items-center justify-between gap-2 border-b border-[var(--panel-border)] py-2">
        <Link
          to="/"
          className="inline-flex min-h-11 items-center px-2 text-sm font-medium text-[var(--ink-muted)] hover:text-[var(--ink)]"
        >
          Home
        </Link>
        <h1 className="font-display absolute left-1/2 -translate-x-1/2 text-xl font-semibold tracking-tight text-[var(--ink)] sm:text-2xl">
          Connections
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
      </header>

      <div className="mt-3 flex flex-wrap items-end gap-2 text-sm">
        <label className="flex flex-col gap-1 text-[var(--ink-muted)]">
          Source
          <select
            className="min-h-11 rounded-md border border-[var(--panel-border)] bg-[var(--panel)] px-3 text-[var(--ink)]"
            value={sourceLabel}
            onChange={(e) => setSource(e.target.value as ConnectionsSource)}
            aria-label="Puzzle source"
          >
            <option value="tonni">Tonni (custom)</option>
            <option value="nyt">NYT (personal use)</option>
          </select>
        </label>
        {sourceLabel === "tonni" ? (
          <label className="flex flex-col gap-1 text-[var(--ink-muted)]">
            Pack puzzle
            <select
              className="min-h-11 max-w-[12rem] rounded-md border border-[var(--panel-border)] bg-[var(--panel)] px-3 text-[var(--ink)]"
              value={puzzle.id}
              onChange={(e) => setTonniPuzzle(e.target.value)}
              aria-label="Tonni puzzle"
            >
              {tonniList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <label className="flex flex-col gap-1 text-[var(--ink-muted)]">
            Date
            <input
              type="date"
              className="min-h-11 rounded-md border border-[var(--panel-border)] bg-[var(--panel)] px-3 text-[var(--ink)]"
              value={nytDate}
              onChange={(e) => setNytDate(e.target.value)}
              aria-label="NYT Connections date"
            />
          </label>
        )}
      </div>

      <p className="mt-2 text-center text-xs text-[var(--ink-muted)]">
        {puzzle.title}
        {puzzle.dateKey ? ` \u00b7 ${puzzle.dateKey}` : ""}
        {sourceLabel === "nyt" ? " \u00b7 unofficial NYT" : " \u00b7 Tonni pack"}
      </p>

      <div
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {statusAnn}
      </div>

      <div className="relative mt-3 flex flex-1 flex-col">
        <Toast message={toast} />

        <div className="flex flex-col gap-2" aria-live="polite">
          {displayGroups.map((group) => (
            <FoundGroupRow key={groupKey(group)} group={group} />
          ))}
        </div>

        <div
          id="connections-board"
          className={cn("mt-2 grid grid-cols-4 gap-2", shake && "conn-shake")}
          role="group"
          aria-label="Word board"
        >
          {board.map((word) => {
            const n = normalizeWord(word);
            const isSelected = selected.includes(n);
            const selIndex = selected.indexOf(n);
            return (
              <button
                key={word}
                type="button"
                className={cn(
                  "conn-tile min-h-14 rounded-md px-1 text-center text-[0.7rem] font-bold uppercase leading-tight tracking-wide transition sm:min-h-16 sm:text-xs",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-brand)]",
                  isSelected ? "conn-tile-selected" : "conn-tile-idle",
                )}
                aria-pressed={isSelected}
                aria-label={
                  isSelected
                    ? `${word}, selected ${selIndex + 1} of ${selected.length}`
                    : word
                }
                disabled={status !== "playing" || submitting}
                onClick={() => toggleWord(word)}
                style={{ touchAction: "manipulation" }}
              >
                {word}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-[var(--ink)]">
          <span>Mistakes remaining:</span>
          <div
            className="flex gap-1.5"
            aria-label={`${MAX_MISTAKES - mistakes} mistakes remaining`}
          >
            {mistakesRemainingDots(mistakes).map((on, i) => (
              <span
                key={i}
                className={cn(
                  "h-3 w-3 rounded-full",
                  on ? "bg-[var(--ink)]" : "bg-[var(--panel-border)]",
                )}
                aria-hidden
              />
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            className="conn-btn"
            onClick={shuffleBoard}
            disabled={status !== "playing"}
          >
            Shuffle
          </button>
          <button
            type="button"
            className="conn-btn"
            onClick={deselectAll}
            disabled={status !== "playing" || selected.length === 0}
          >
            Deselect
          </button>
          <button
            type="button"
            className="conn-btn conn-btn-primary"
            onClick={submit}
            disabled={
              status !== "playing" ||
              selected.length !== GROUP_SIZE ||
              submitting
            }
          >
            Submit
          </button>
        </div>

        {status !== "playing" && (
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              className="conn-btn conn-btn-primary inline-flex items-center gap-2"
              onClick={() => void share()}
            >
              <Share2 className="h-4 w-4" aria-hidden />
              Share
            </button>
          </div>
        )}
      </div>

      <HowToPlayConnections
        open={helpOpen}
        onOpenChange={setHelpOpen}
      />
      <ResultDialog
        open={resultOpen}
        onOpenChange={setResultOpen}
        status={status}
        puzzle={puzzle}
        solved={solved}
        mistakes={mistakes}
        onShare={() => void share()}
      />
    </div>
  );
}

function FoundGroupRow({ group }: { group: ConnectionGroup }) {
  const color = DIFFICULTY_COLORS[group.difficulty];
  return (
    <div
      className={cn(
        "conn-found rounded-md px-3 py-3 text-center",
        `conn-found-${color}`,
      )}
      role="status"
    >
      <div className="text-xs font-bold tracking-wide uppercase">
        {group.title}
      </div>
      <div className="mt-0.5 text-[0.7rem] font-semibold uppercase tracking-wide opacity-90 sm:text-xs">
        {group.words.join(", ")}
      </div>
      <span className="sr-only">
        {DIFFICULTY_LABELS[group.difficulty]} difficulty
      </span>
    </div>
  );
}

function HowToPlayConnections({
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
      title="How to play Connections"
    >
      <div className="space-y-3 text-sm text-[var(--ink)]">
        <p>Find four groups of four words that share something in common.</p>
        <ul className="list-disc space-y-1 pl-5 text-[var(--ink-muted)]">
          <li>Select four words, then Submit.</li>
          <li>Correct groups lock in with a difficulty color.</li>
          <li>You can make four mistakes.</li>
          <li>
            Colors from easiest to hardest: yellow, green, blue, purple.
          </li>
        </ul>
        <p className="text-xs text-[var(--ink-muted)]">
          Tonni packs are original. NYT source is an unofficial personal-use
          fetch with soft fallback \u2014 not affiliated with The New York Times.
        </p>
      </div>
    </Modal>
  );
}

function ResultDialog({
  open,
  onOpenChange,
  status,
  puzzle,
  solved,
  mistakes,
  onShare,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  status: ConnectionsGameStatus;
  puzzle: ConnectionsPuzzle;
  solved: ConnectionGroup[];
  mistakes: number;
  onShare: () => void;
}) {
  const won = status === "won";
  const payload = buildConnectionsShare({
    puzzle,
    foundGroups: solved,
    mistakes,
    won,
  });

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={won ? "Nice work!" : "Next time"}
    >
      <div className="space-y-4 text-center text-sm text-[var(--ink)]">
        <p>
          {won
            ? `Solved with ${mistakes} mistake${mistakes === 1 ? "" : "s"}.`
            : "Out of mistakes \u2014 categories revealed."}
        </p>
        <pre
          className="mx-auto w-fit whitespace-pre text-left text-lg leading-tight"
          aria-label="Result grid"
        >
          {payload.emojiGrid}
        </pre>
        <p className="sr-only">{payload.plainSummary}</p>
        <button
          type="button"
          className="conn-btn conn-btn-primary inline-flex items-center gap-2"
          onClick={onShare}
        >
          <Share2 className="h-4 w-4" aria-hidden />
          Share
        </button>
      </div>
    </Modal>
  );
}
