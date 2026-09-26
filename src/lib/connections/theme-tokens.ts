/**
 * Connections CSS token contract for Themes (ADR 0012 / 0013).
 *
 * Games read these CSS variables — Themes registry should set them per theme
 * when stacking Connections onto the Themes branch. Until then, `index.css`
 * defines light/dark fallbacks under `[data-theme="light"|"dark"]`.
 */
export const CONNECTIONS_TOKEN_CSS_VARS = {
  connYellow: "--conn-yellow",
  connGreen: "--conn-green",
  connBlue: "--conn-blue",
  connPurple: "--conn-purple",
  connYellowInk: "--conn-yellow-ink",
  connGreenInk: "--conn-green-ink",
  connBlueInk: "--conn-blue-ink",
  connPurpleInk: "--conn-purple-ink",
  connTileBg: "--conn-tile-bg",
  connTileSelected: "--conn-tile-selected",
  connTileSelectedInk: "--conn-tile-selected-ink",
  connTileInk: "--conn-tile-ink",
} as const;

export type ConnectionsTokenKey = keyof typeof CONNECTIONS_TOKEN_CSS_VARS;
