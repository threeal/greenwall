import { afterEach, describe, expect, test, vi } from "vitest";
import {
  loadStoredContributions,
  storeContributions,
} from "./contributionsStorage.ts";
import type { ContributionDay } from "./types.ts";

const USERNAME = "contributions-storage-test";

const CONTRIBUTIONS: ContributionDay[] = [
  { date: "2026-08-20", count: 2, level: 2 },
  { date: "2026-08-24", count: 5, level: 3 },
];

afterEach(() => {
  localStorage.removeItem(`contributions:${USERNAME}`);
  vi.restoreAllMocks();
});

describe("loadStoredContributions", () => {
  test("returns the contributions stored for the user", () => {
    storeContributions(USERNAME, CONTRIBUTIONS);
    expect(loadStoredContributions(USERNAME)).toEqual(CONTRIBUTIONS);
  });

  test("returns the latest contributions stored for the user", () => {
    storeContributions(USERNAME, CONTRIBUTIONS);
    storeContributions(USERNAME, CONTRIBUTIONS.slice(1));
    expect(loadStoredContributions(USERNAME)).toEqual(CONTRIBUTIONS.slice(1));
  });

  test("returns undefined when nothing is stored for the user", () => {
    expect(loadStoredContributions(USERNAME)).toBeUndefined();
  });

  test("returns undefined for an unsupported version", () => {
    localStorage.setItem(
      `contributions:${USERNAME}`,
      JSON.stringify({ version: 99, contributions: CONTRIBUTIONS }),
    );
    expect(loadStoredContributions(USERNAME)).toBeUndefined();
  });

  test("returns undefined for a value that isn't valid JSON", () => {
    localStorage.setItem(`contributions:${USERNAME}`, "{");
    expect(loadStoredContributions(USERNAME)).toBeUndefined();
  });
});

describe("storeContributions", () => {
  test("does nothing when the storage can't be written", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("quota exceeded", "QuotaExceededError");
    });
    storeContributions(USERNAME, CONTRIBUTIONS);
    expect(loadStoredContributions(USERNAME)).toBeUndefined();
  });
});
