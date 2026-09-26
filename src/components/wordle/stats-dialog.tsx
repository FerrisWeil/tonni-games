import type { ReactNode } from "react";
import { Modal } from "@/components/ui/modal";
import { winPercent } from "@/lib/storage";
import type { Stats } from "@/lib/types";

interface StatsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stats: Stats;
  status: "playing" | "won" | "lost";
  solution?: string;
}

export function StatsDialog({
  open,
  onOpenChange,
  stats,
  status,
  solution,
}: StatsDialogProps) {
  const maxBar = Math.max(1, ...stats.guessDistribution);

  let description: ReactNode = "Your Tonni Wordle track record.";
  if (status === "won") description = "Nice work — see you tomorrow.";
  if (status === "lost" && solution) {
    description = `The word was ${solution.toUpperCase()}.`;
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
        <Stat value={stats.maxStreak} label="Max Streak" />
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
