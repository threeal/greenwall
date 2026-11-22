import { afterEach, describe, expect, test, vi } from "vitest";
import {
  applyTheme,
  loadTheme,
  loadToken,
  storeTheme,
  storeToken,
  subscribeToken,
} from "./settingsStorage.ts";

afterEach(() => {
  localStorage.removeItem("theme");
  localStorage.removeItem("token");
  delete document.documentElement.dataset.theme;
  vi.restoreAllMocks();
});

describe("loadTheme", () => {
  test("returns the stored theme", () => {
    storeTheme("dark");
    expect(loadTheme()).toBe("dark");
  });

  test("returns an empty string when no theme is stored", () => {
    expect(loadTheme()).toBe("");
  });

  test("returns an empty string when the storage can't be read", () => {
    storeTheme("dark");
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("access denied", "SecurityError");
    });
    expect(loadTheme()).toBe("");
  });
});

describe("storeTheme", () => {
  test("removes the stored theme for an empty theme", () => {
    storeTheme("dark");
    storeTheme("");
    expect(localStorage.getItem("theme")).toBeNull();
  });

  test("does nothing when the storage can't be written", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("quota exceeded", "QuotaExceededError");
    });
    storeTheme("dark");
    expect(loadTheme()).toBe("");
  });
});

describe("applyTheme", () => {
  test("follows the system for an empty theme", () => {
    document.documentElement.dataset.theme = "dark";
    applyTheme("");
    expect(document.documentElement.dataset.theme).toBeUndefined();
  });

  test("sets the theme on the root element", () => {
    applyTheme("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
  });
});

describe("loadToken", () => {
  test("returns the stored token", () => {
    storeToken("github_pat_test");
    expect(loadToken()).toBe("github_pat_test");
  });

  test("returns an empty string when no token is stored", () => {
    expect(loadToken()).toBe("");
  });
});

describe("storeToken", () => {
  test("removes the stored token for an empty token", () => {
    storeToken("github_pat_test");
    storeToken("");
    expect(localStorage.getItem("token")).toBeNull();
  });
});

describe("subscribeToken", () => {
  test("calls the listener whenever a token is stored or removed", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToken(listener);
    storeToken("github_pat_test");
    storeToken("");
    expect(listener).toHaveBeenCalledTimes(2);

    unsubscribe();
    storeToken("github_pat_test");
    expect(listener).toHaveBeenCalledTimes(2);
  });
});
