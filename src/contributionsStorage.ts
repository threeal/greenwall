import * as v from "valibot";
import { type ContributionDay, ContributionDaySchema } from "./types.ts";

const StoredContributionsV1Schema = v.object({
  version: v.literal(1),
  contributions: v.array(ContributionDaySchema),
});

// Dispatches on the version, so a stored layout of another version needs only its own schema here.
const StoredContributionsSchema = v.variant("version", [
  StoredContributionsV1Schema,
]);

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
    const result = v.safeParse(StoredContributionsSchema, JSON.parse(item));
    if (!result.success) return undefined;
    return result.output.contributions;
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
  const stored: v.InferInput<typeof StoredContributionsV1Schema> = {
    version: 1,
    contributions,
  };
  try {
    localStorage.setItem(storageKey(username), JSON.stringify(stored));
  } catch {
    // The stored contributions are only a stand-in while loading, so skip storing them.
  }
}
