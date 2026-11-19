/** The page's theme: following the system, or always light or dark. */
export type Theme = "system" | "light" | "dark";

export interface Settings {
  theme: Theme;
  /** The GitHub token to fetch contributions with, if one is given. */
  token?: string;
}

interface StoredSettingsV1 {
  version: 1;
  theme: unknown;
  token?: unknown;
}

const STORAGE_KEY = "settings";

const DEFAULT_SETTINGS: Settings = { theme: "system" };

const listeners = new Set<() => void>();

/**
 * Parses a stored theme, falling back to the default for a value that isn't a known theme.
 * @param theme - The stored theme.
 * @returns The theme.
 */
function parseTheme(theme: unknown): Theme {
  switch (theme) {
    case "system":
    case "light":
    case "dark":
      return theme;
    default:
      return DEFAULT_SETTINGS.theme;
  }
}

/**
 * Parses a stored token, dropping a value that isn't a non-empty string.
 * @param token - The stored token.
 * @returns The token, or undefined if none is stored.
 */
function parseToken(token: unknown): string | undefined {
  return typeof token === "string" && token !== "" ? token : undefined;
}

/**
 * Loads the settings stored by an earlier visit.
 * @returns The stored settings, or the default settings if none are stored or they can't be read.
 */
export function loadSettings(): Settings {
  try {
    const item = localStorage.getItem(STORAGE_KEY);
    if (item === null) return DEFAULT_SETTINGS;
    const stored = JSON.parse(item) as { version: unknown };
    switch (stored.version) {
      case 1: {
        const { theme, token } = stored as StoredSettingsV1;
        return { theme: parseTheme(theme), token: parseToken(token) };
      }
      default:
        return DEFAULT_SETTINGS;
    }
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/**
 * Stores the settings for later visits, replacing any stored before, and notifies the subscribers.
 * Does nothing if the storage is unavailable or full.
 * @param settings - The settings to store.
 */
export function storeSettings(settings: Settings) {
  const stored: StoredSettingsV1 = { version: 1, ...settings };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // The settings still apply to this visit, so skip storing them.
  }
  for (const listener of listeners) {
    listener();
  }
}

/**
 * Subscribes to stored settings changes.
 * @param listener - Called after the settings are stored.
 * @returns A function that unsubscribes the listener.
 */
export function subscribeSettings(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Applies a theme to the page.
 * @param theme - The theme to apply.
 */
export function applyTheme(theme: Theme) {
  const { dataset } = document.documentElement;
  switch (theme) {
    case "system":
      delete dataset.dark;
      break;
    case "light":
      dataset.dark = "false";
      break;
    case "dark":
      dataset.dark = "true";
      break;
  }
}
