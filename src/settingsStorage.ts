import * as v from "valibot";

const ThemeSchema = v.picklist(["system", "light", "dark"]);

/** The page's theme: following the system, or always light or dark. */
export type Theme = v.InferOutput<typeof ThemeSchema>;

export interface Settings {
  theme: Theme;
  /** The GitHub token to fetch contributions with, if one is given. */
  token?: string;
}

const STORAGE_KEY = "settings";

const DEFAULT_SETTINGS: Settings = { theme: "system" };

// A field with an invalid value falls back to its default, keeping the other fields.
const StoredSettingsV1Schema = v.object({
  version: v.literal(1),
  theme: v.fallback(ThemeSchema, DEFAULT_SETTINGS.theme),
  token: v.fallback(v.optional(v.pipe(v.string(), v.nonEmpty())), undefined),
});

// Dispatches on the version, so a stored layout of another version needs only its own schema here.
const StoredSettingsSchema = v.variant("version", [StoredSettingsV1Schema]);

const listeners = new Set<() => void>();

/**
 * Loads the settings stored by an earlier visit.
 * @returns The stored settings, or the default settings if none are stored or they can't be read.
 */
export function loadSettings(): Settings {
  try {
    const item = localStorage.getItem(STORAGE_KEY);
    if (item === null) return DEFAULT_SETTINGS;
    const result = v.safeParse(StoredSettingsSchema, JSON.parse(item));
    if (!result.success) return DEFAULT_SETTINGS;
    const { theme, token } = result.output;
    return { theme, token };
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
  const stored: v.InferInput<typeof StoredSettingsV1Schema> = {
    version: 1,
    ...settings,
  };
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
