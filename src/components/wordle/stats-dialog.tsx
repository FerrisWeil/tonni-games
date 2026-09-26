import { useState, type ReactNode } from "react";
import { Modal } from "@/components/ui/modal";
import { buildShareText, copyShareText } from "@/lib/share";
import { winPercent } from "@/lib/storage";
import type { Stats } from "@/lib/types";

interface StatsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stats: Stats;
  status: "playing" | "won" | "lost";
  solution?: string;
  guesses?: string[];
  puzzleNumber?: number;
}

export function StatsDialog({
  open,
  onOpenChange,
  stats,
  status,
  solution,
  guesses = [],
  puzzleNumber = 0,
}: StatsDialogProps) {
  const maxBar = Math.max(1, ...stats.guessDistribution);
  const [shareNote, setShareNote] = useState<string | null>(null);

  let description: ReactNode = "Played on this device — nothing to sign in for.";
  if (status === "won") description = "Nice work — see you tomorrow.";
  if (status === "lost" && solution) {
    description = `The word was ${solution.toUpperCase()}.`;
  }

  const canShare =
    (status === "won" || status === "lost") &&
    guesses.length > 0 &&
    !!solution &&
    puzzleNumber > 0;

  async function onShare() {
    if (!canShare || !solution) return;
    const payload = buildShareText({
      puzzleNumber,
      guesses,
      solution,
      won: status === "won",
    });
    const ok = await copyShareText(payload.clipboard);
    setShareNote(ok ? "Copied results to clipboard" : "Couldn't copy — try again");
    window.setTimeout(() => setShareNote(null), 1800);
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Statistics"
      description={description}
    >
      <div className="grid grid-cols-4 gap-2 text-center">
        <Stat value={stats.played} label="Played" />
        <Stat value={winPercent(stats)} label="Win %" />
        <Stat value={stats.currentStreak} label="Streak" />
        <Stat value={stats.maxStreak} label="Max" />
      </div>

      <div className="mt-6">
        <h3 className="mb-3 text-xs font-bold tracking-[0.15em] text-[var(--ink-muted)] uppercase">
          Guess distribution
        </h3>
        <div className="flex flex-col gap-1.5">
          {stats.guessDistribution.map((count, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <span className="w-3 tabular-nums">{i + 1}</span>
              <div className="h-5 flex-1 overflow-hidden rounded-sm bg-[var(--bar-track)]">
                <div
                  className="flex h-full min-w-[1.5rem] items-center justify-end bg-[var(--tile-correct)] px-1.5 text-xs font-bold text-white transition-all"
                  style={{
                    width: `${Math.max((count / maxBar) * 100, count ? 8 : 0)}%`,
                  }}
                >
                  {count}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {canShare ? (
        <div className="mt-6">
          <button
            type="button"
            onClick={() => void onShare()}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-[var(--accent-brand)] px-4 text-sm font-bold tracking-wide text-white uppercase transition hover:brightness-110 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-brand)]"
            style={{ touchAction: "manipulation" }}
          >
            Share
          </button>
          <p className="mt-2 text-center text-xs text-[var(--ink-muted)]">
            Copies a spoiler-free grid plus a short text summary.
          </p>
          <div className="sr-only" aria-live="polite">
            {shareNote ?? ""}
          </div>
          {shareNote ? (
            <p className="mt-2 text-center text-sm font-semibold text-[var(--accent-brand)]" aria-hidden>
              {shareNote}
            </p>
          ) : null}
        </div>
      ) : null}
    </Modal>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <div className="font-display text-3xl leading-none font-semibold tabular-nums">
        {value}
      </div>
      <div className="mt-1 text-[10px] tracking-wide text-[var(--ink-muted)] uppercase">
        {label}
      </div>
    </div>
  );
}
