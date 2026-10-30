import type { ContributionDay } from "./types.ts";

interface StoredContributionsV1 {
  version: 1;
  contributions: ContributionDay[];
}

/**
 * Gets the `localStorage` key holding a user's stored contributions.
 * @param username - The GitHub username.
 * @returns The storage key.
 */
function storageKey(username: string) {
  return `contributions:${username}`;
}

/**
 * Loads a user's contributions stored by an earlier fetch.
 * @param username - The GitHub username.
 * @returns The stored contributions, or undefined if none are stored or they can't be read.
 */
export function loadStoredContributions(
  username: string,
): ContributionDay[] | undefined {
  try {
    const item = localStorage.getItem(storageKey(username));
    if (item === null) return undefined;
    const stored = JSON.parse(item) as { version: unknown };
    switch (stored.version) {
      case 1:
        return (stored as StoredContributionsV1).contributions;
      default:
        return undefined;
    }
  } catch {
    return undefined;
  }
}

/**
 * Stores a user's contributions for later page loads, replacing any stored before.
 * Does nothing if the storage is unavailable or full.
 * @param username - The GitHub username.
 * @param contributions - The contributions to store.
 */
export function storeContributions(
  username: string,
  contributions: ContributionDay[],
) {
  const stored: StoredContributionsV1 = { version: 1, contributions };
  try {
    localStorage.setItem(storageKey(username), JSON.stringify(stored));
  } catch {
    // The stored contributions are only a stand-in while loading, so skip storing them.
  }
}
