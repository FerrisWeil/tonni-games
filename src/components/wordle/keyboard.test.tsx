import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { Keyboard } from "@/components/wordle/keyboard";
import { Board } from "@/components/wordle/board";
import { HomePage } from "@/pages/home";
import { Tile } from "@/components/wordle/tile";

describe("Keyboard", () => {
  it("fires onKey for letter taps", async () => {
    const user = userEvent.setup();
    const onKey = vi.fn();
    render(<Keyboard letterStates={{}} onKey={onKey} />);
    await user.click(screen.getByRole("button", { name: "A" }));
    expect(onKey).toHaveBeenCalledWith("a");
  });

  it("exposes evaluation state in the accessible name", () => {
    render(
      <Keyboard letterStates={{ a: "correct" }} onKey={() => undefined} />,
    );
    expect(
      screen.getByRole("button", { name: "A, correct" }),
    ).toBeInTheDocument();
  });

  it("does not fire when disabled", async () => {
    const user = userEvent.setup();
    const onKey = vi.fn();
    render(<Keyboard letterStates={{}} onKey={onKey} disabled />);
    await user.click(screen.getByRole("button", { name: "A" }));
    expect(onKey).not.toHaveBeenCalled();
  });
});

describe("Board / Tile a11y", () => {
  it("labels tiles with letter and state", () => {
    render(<Tile letter="p" state="present" />);
    expect(screen.getByRole("img", { name: "P, present" })).toBeInTheDocument();
  });

  it("renders a grid for six rows", () => {
    render(
      <Board
        guesses={["crane"]}
        currentGuess="ab"
        solution="crane"
        revealingRow={null}
        shakeRow={false}
      />,
    );
    expect(screen.getByRole("grid")).toHaveAttribute("aria-rowcount", "6");
    expect(
      screen.getByRole("img", { name: "C, correct" }),
    ).toBeInTheDocument();
  });
});

describe("HomePage", () => {
  it("links to Wordle", () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );
    const link = screen.getByRole("link", { name: /play wordle/i });
    expect(link).toHaveAttribute("href", "/wordle");
  });
});
