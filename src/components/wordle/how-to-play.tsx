import type { ReactNode } from "react";
import { Modal } from "@/components/ui/modal";

interface HowToPlayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HowToPlayDialog({ open, onOpenChange }: HowToPlayDialogProps) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="How to play"
      description="Guess the 5-letter word in 6 tries. A new puzzle arrives every day — free, with no play limits."
    >
      <ul className="space-y-3 text-sm text-[var(--ink)]">
        <li>Each guess must be a valid 5-letter word. Hit Enter to submit.</li>
        <li>
          After each guess, tiles change color to show how close you were.
        </li>
      </ul>

      <div className="mt-4 space-y-3">
        <Example
          word="plant"
          states={["correct", "absent", "absent", "absent", "absent"]}
          note={
            <>
              <strong>P</strong> is in the word and in the correct spot.
            </>
          }
        />
        <Example
          word="cloud"
          states={["absent", "present", "absent", "absent", "absent"]}
          note={
            <>
              <strong>L</strong> is in the word but in the wrong spot.
            </>
          }
        />
        <Example
          word="shine"
          states={["absent", "absent", "absent", "absent", "absent"]}
          note={<>None of these letters are in the word.</>}
        />
      </div>
    </Modal>
  );
}

function Example({
  word,
  states,
  note,
}: {
  word: string;
  states: Array<"correct" | "present" | "absent">;
  note: ReactNode;
}) {
  const color: Record<string, string> = {
    correct: "bg-[var(--tile-correct)] text-white border-transparent",
    present: "bg-[var(--tile-present)] text-white border-transparent",
    absent: "bg-[var(--tile-absent)] text-white border-transparent",
  };
  return (
    <div>
      <div className="mb-1.5 flex gap-1">
        {word.split("").map((ch, i) => (
          <div
            key={i}
            className={`flex h-10 w-10 items-center justify-center border-2 text-lg font-bold uppercase ${color[states[i]]}`}
          >
            {ch}
          </div>
        ))}
      </div>
      <p className="text-sm text-[var(--ink-muted)]">{note}</p>
    </div>
  );
}
