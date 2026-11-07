import type { Theme } from "./types.ts";

const STORAGE_KEY = "theme";

interface StoredThemeV1 {
  version: 1;
  theme: Theme;
}

/**
 * Loads the theme chosen on an earlier visit.
 * @returns The stored theme, or undefined if none is stored or it can't be read.
 */
export function loadStoredTheme(): Theme | undefined {
  try {
    const item = localStorage.getItem(STORAGE_KEY);
    if (item === null) return undefined;
    const stored = JSON.parse(item) as { version: unknown; theme?: unknown };
    switch (stored.version) {
      case 1: {
        const { theme } = stored;
        return theme === "light" || theme === "dark" ? theme : undefined;
      }
      default:
        return undefined;
    }
  } catch {
    return undefined;
  }
}

/**
 * Stores the chosen theme for later visits, replacing any stored before.
 * Does nothing if the storage is unavailable or full.
 * @param theme - The chosen theme.
 */
export function storeTheme(theme: Theme) {
  const stored: StoredThemeV1 = { version: 1, theme };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // The theme still applies to this visit, so skip remembering it.
  }
}
