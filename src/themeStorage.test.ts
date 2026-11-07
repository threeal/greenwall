import { afterEach, describe, expect, test, vi } from "vitest";
import { loadStoredTheme, storeTheme } from "./themeStorage.ts";

afterEach(() => {
  localStorage.removeItem("theme");
  vi.restoreAllMocks();
});

describe("loadStoredTheme", () => {
  test("returns the stored theme", () => {
    storeTheme("dark");
    expect(loadStoredTheme()).toBe("dark");
  });

  test("returns the latest stored theme", () => {
    storeTheme("dark");
    storeTheme("light");
    expect(loadStoredTheme()).toBe("light");
  });

  test("returns undefined when nothing is stored", () => {
    expect(loadStoredTheme()).toBeUndefined();
  });

  test("returns undefined for an unsupported version", () => {
    localStorage.setItem(
      "theme",
      JSON.stringify({ version: 99, theme: "dark" }),
    );
    expect(loadStoredTheme()).toBeUndefined();
  });

  test("returns undefined for an unknown theme", () => {
    localStorage.setItem(
      "theme",
      JSON.stringify({ version: 1, theme: "sepia" }),
    );
    expect(loadStoredTheme()).toBeUndefined();
  });

  test("returns undefined for a value that isn't valid JSON", () => {
    localStorage.setItem("theme", "{");
    expect(loadStoredTheme()).toBeUndefined();
  });
});

describe("storeTheme", () => {
  test("does nothing when the storage can't be written", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("quota exceeded", "QuotaExceededError");
    });
    storeTheme("dark");
    expect(loadStoredTheme()).toBeUndefined();
  });
});
