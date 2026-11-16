import { afterEach, describe, expect, test, vi } from "vitest";
import { applyTheme, loadSettings, storeSettings } from "./settingsStorage.ts";

afterEach(() => {
  localStorage.removeItem("settings");
  delete document.documentElement.dataset.dark;
  vi.restoreAllMocks();
});

describe("loadSettings", () => {
  test("returns the stored settings", () => {
    storeSettings({ theme: "dark" });
    expect(loadSettings()).toEqual({ theme: "dark" });
  });

  test("returns the latest stored settings", () => {
    storeSettings({ theme: "dark" });
    storeSettings({ theme: "light" });
    expect(loadSettings()).toEqual({ theme: "light" });
  });

  test("returns the default settings when nothing is stored", () => {
    expect(loadSettings()).toEqual({ theme: "system" });
  });

  test("returns the default settings for an unsupported version", () => {
    localStorage.setItem(
      "settings",
      JSON.stringify({ version: 99, theme: "dark" }),
    );
    expect(loadSettings()).toEqual({ theme: "system" });
  });

  test("returns the default settings for a value that isn't valid JSON", () => {
    localStorage.setItem("settings", "{");
    expect(loadSettings()).toEqual({ theme: "system" });
  });

  test("returns the default theme for an unknown stored theme", () => {
    localStorage.setItem(
      "settings",
      JSON.stringify({ version: 1, theme: "sepia" }),
    );
    expect(loadSettings()).toEqual({ theme: "system" });
  });
});

describe("storeSettings", () => {
  test("does nothing when the storage can't be written", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("quota exceeded", "QuotaExceededError");
    });
    storeSettings({ theme: "dark" });
    expect(loadSettings()).toEqual({ theme: "system" });
  });
});

describe("applyTheme", () => {
  test("follows the system for the system theme", () => {
    document.documentElement.dataset.dark = "true";
    applyTheme("system");
    expect(document.documentElement.dataset.dark).toBeUndefined();
  });

  test("turns off dark mode for the light theme", () => {
    applyTheme("light");
    expect(document.documentElement.dataset.dark).toBe("false");
  });

  test("turns on dark mode for the dark theme", () => {
    applyTheme("dark");
    expect(document.documentElement.dataset.dark).toBe("true");
  });
});
