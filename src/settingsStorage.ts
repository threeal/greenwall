// Each setting is stored under its own key as a plain string, with an empty string for no value.
// The inline script in `index.html` reads the theme key too, to apply the stored theme before the first paint.
const THEME_KEY = "theme";
const TOKEN_KEY = "token";

const tokenListeners = new Set<() => void>();

/**
 * Loads the theme stored by an earlier visit.
 * @returns The stored theme, `"light"` or `"dark"`, or an empty string to follow the system.
 */
export function loadTheme() {
  return loadItem(THEME_KEY);
}

/**
 * Stores the theme for later visits.
 * @param theme - The theme to store, `"light"` or `"dark"`, or an empty string to follow the system.
 */
export function storeTheme(theme: string) {
  storeItem(THEME_KEY, theme);
}

/**
 * Applies a theme to the page. The stylesheet matches only `"light"` and `"dark"`, so any other theme follows the system.
 * @param theme - The theme to apply.
 */
export function applyTheme(theme: string) {
  const { dataset } = document.documentElement;
  if (theme === "") {
    delete dataset.theme;
  } else {
    dataset.theme = theme;
  }
}

/**
 * Loads the GitHub token stored by an earlier visit, to fetch contributions with.
 * @returns The stored token, or an empty string if there's none.
 */
export function loadToken() {
  return loadItem(TOKEN_KEY);
}

/**
 * Stores the GitHub token for later visits and notifies the subscribers.
 * @param token - The token to store, or an empty string to remove the stored one.
 */
export function storeToken(token: string) {
  storeItem(TOKEN_KEY, token);
  for (const listener of tokenListeners) {
    listener();
  }
}

/**
 * Subscribes to stored GitHub token changes.
 * @param listener - Called after a token is stored or removed.
 * @returns A function that unsubscribes the listener.
 */
export function subscribeToken(listener: () => void) {
  tokenListeners.add(listener);
  return () => {
    tokenListeners.delete(listener);
  };
}

/**
 * Loads the value stored under a key.
 * @param key - The key the value is stored under.
 * @returns The stored value, or an empty string if there's none or the storage can't be read.
 */
function loadItem(key: string) {
  try {
    return localStorage.getItem(key) ?? "";
  } catch {
    return "";
  }
}

/**
 * Stores a value under a key, or removes the key for an empty value.
 * Does nothing if the storage is unavailable or full.
 * @param key - The key to store the value under.
 * @param value - The value to store.
 */
function storeItem(key: string, value: string) {
  try {
    if (value === "") {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, value);
    }
  } catch {
    // The setting just isn't kept for later visits.
  }
}
