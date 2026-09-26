import { WordleGame } from "@/components/wordle/game";

export default function App() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col">
      <WordleGame />
    </div>
  );
}
