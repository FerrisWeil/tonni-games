/**
 * Mastermind CSS token contract — mirrored in Themes registry
 * (`src/themes/registry.ts` ThemeTokens + TOKEN_CSS_VARS).
 * Games read these CSS variables; Themes applyResolvedTheme sets them.
 */
export const MASTERMIND_TOKEN_CSS_VARS = {
  mmPeg0: "--mm-peg-0",
  mmPeg1: "--mm-peg-1",
  mmPeg2: "--mm-peg-2",
  mmPeg3: "--mm-peg-3",
  mmPeg4: "--mm-peg-4",
  mmPeg5: "--mm-peg-5",
  mmPeg6: "--mm-peg-6",
  mmPeg7: "--mm-peg-7",
  mmExact: "--mm-exact",
  mmNear: "--mm-near",
} as const;

export type MastermindTokenKey = keyof typeof MASTERMIND_TOKEN_CSS_VARS;

/** CSS var for peg color index. */
export function mmPegVar(index: number): string {
  return `var(--mm-peg-${index})`;
}
