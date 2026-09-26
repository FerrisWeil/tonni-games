/**
 * Connections CSS token contract — mirrored in Themes registry
 * (`src/themes/registry.ts` ThemeTokens + TOKEN_CSS_VARS).
 * Games read these CSS variables; Themes applyResolvedTheme sets them.
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
