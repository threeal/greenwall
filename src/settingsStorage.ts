/** The page's theme: following the system, or always light or dark. */
export type Theme = "system" | "light" | "dark";

export interface Settings {
  theme: Theme;
}

interface StoredSettingsV1 {
  version: 1;
  theme: unknown;
}

const STORAGE_KEY = "settings";

const DEFAULT_SETTINGS: Settings = { theme: "system" };

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
 * Loads the settings stored by an earlier visit.
 * @returns The stored settings, or the default settings if none are stored or they can't be read.
 */
export function loadSettings(): Settings {
  try {
    const item = localStorage.getItem(STORAGE_KEY);
    if (item === null) return DEFAULT_SETTINGS;
    const stored = JSON.parse(item) as { version: unknown };
    switch (stored.version) {
      case 1:
        return { theme: parseTheme((stored as StoredSettingsV1).theme) };
      default:
        return DEFAULT_SETTINGS;
    }
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/**
 * Stores the settings for later visits, replacing any stored before.
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
