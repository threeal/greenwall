import { useState, useSyncExternalStore } from "react";
import { loadStoredTheme, storeTheme } from "../themeStorage.ts";
import type { Theme } from "../types.ts";
import styles from "./ThemeToggle.module.css";

const DARK_SCHEME_QUERY = "(prefers-color-scheme: dark)";

/**
 * Subscribes to changes of the system's color scheme.
 * @param onChange - Called whenever the system's color scheme changes.
 * @returns A function that unsubscribes.
 */
function subscribeToSystemTheme(onChange: () => void) {
  const query = window.matchMedia(DARK_SCHEME_QUERY);
  query.addEventListener("change", onChange);
  return () => {
    query.removeEventListener("change", onChange);
  };
}

/**
 * Gets the theme the system's color scheme currently prefers.
 * @returns The system theme.
 */
function getSystemTheme(): Theme {
  return window.matchMedia(DARK_SCHEME_QUERY).matches ? "dark" : "light";
}

/**
 * Renders a button that switches between light and dark mode, following the system theme until clicked.
 * The button's icon shows the current theme, a moon for dark and a sun for light.
 * The chosen theme is applied to the root element and stored for later visits.
 * @returns A button element.
 */
export default function ThemeToggle() {
  const systemTheme = useSyncExternalStore(
    subscribeToSystemTheme,
    getSystemTheme,
  );
  const [chosenTheme, setChosenTheme] = useState(loadStoredTheme);
  const theme = chosenTheme ?? systemTheme;
  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      className={styles.button}
      aria-label={`Switch to ${nextTheme} mode`}
      title={`Switch to ${nextTheme} mode`}
      onClick={() => {
        document.documentElement.dataset.theme = nextTheme;
        storeTheme(nextTheme);
        setChosenTheme(nextTheme);
      }}
    >
      <svg
        viewBox="0 0 16 16"
        width="16"
        height="16"
        fill="currentColor"
        aria-hidden="true"
      >
        {theme === "dark" ? (
          <path d="M9.598 1.591a.749.749 0 0 1 .785-.175 7.001 7.001 0 1 1-8.967 8.967.75.75 0 0 1 .961-.96 5.5 5.5 0 0 0 7.046-7.046.75.75 0 0 1 .175-.786Zm1.616 1.945a7 7 0 0 1-7.678 7.678 5.5 5.5 0 1 0 7.678-7.678Z" />
        ) : (
          <path d="M8 12a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm0-1.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm5.657-8.157a.75.75 0 0 1 0 1.061l-1.061 1.06a.749.749 0 0 1-1.275-.326.749.749 0 0 1 .215-.734l1.06-1.06a.75.75 0 0 1 1.06 0Zm-9.193 9.193a.75.75 0 0 1 0 1.06l-1.06 1.061a.75.75 0 1 1-1.061-1.06l1.06-1.061a.75.75 0 0 1 1.061 0ZM8 0a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0V.75A.75.75 0 0 1 8 0ZM3 8a.75.75 0 0 1-.75.75H.75a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 3 8Zm13 0a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 16 8Zm-8 5a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 8 13Zm3.536-1.464a.75.75 0 0 1 1.06 0l1.061 1.06a.75.75 0 0 1-1.06 1.061l-1.061-1.06a.75.75 0 0 1 0-1.061ZM2.343 2.343a.75.75 0 0 1 1.061 0l1.06 1.061a.751.751 0 0 1-.018 1.042.751.751 0 0 1-1.042.018l-1.06-1.06a.75.75 0 0 1 0-1.06Z" />
        )}
      </svg>
    </button>
  );
}
