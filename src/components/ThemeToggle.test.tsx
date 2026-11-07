import { afterEach, describe, expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { loadStoredTheme, storeTheme } from "../themeStorage.ts";
import ThemeToggle from "./ThemeToggle.tsx";

/**
 * Mocks the system's color scheme.
 * @param dark - Whether the system prefers dark mode.
 * @returns The mocked media query, whose `matches` can be changed before dispatching a `change` event.
 */
function mockSystemTheme(dark: boolean) {
  const query = Object.assign(new EventTarget(), { matches: dark });
  vi.spyOn(window, "matchMedia").mockReturnValue(
    query as unknown as MediaQueryList,
  );
  return query;
}

afterEach(() => {
  localStorage.removeItem("theme");
  delete document.documentElement.dataset.theme;
  vi.restoreAllMocks();
});

describe("ThemeToggle", () => {
  test("offers dark mode when the system prefers light mode", async () => {
    mockSystemTheme(false);
    const screen = await render(<ThemeToggle />);

    await expect
      .element(screen.getByRole("button", { name: "Switch to dark mode" }))
      .toBeVisible();
  });

  test("offers light mode when the system prefers dark mode", async () => {
    mockSystemTheme(true);
    const screen = await render(<ThemeToggle />);

    await expect
      .element(screen.getByRole("button", { name: "Switch to light mode" }))
      .toBeVisible();
  });

  test("follows system theme changes until clicked", async () => {
    const query = mockSystemTheme(false);
    const screen = await render(<ThemeToggle />);

    query.matches = true;
    query.dispatchEvent(new Event("change"));
    await expect
      .element(screen.getByRole("button", { name: "Switch to light mode" }))
      .toBeVisible();
  });

  test("switches and stores the theme when clicked", async () => {
    mockSystemTheme(false);
    const screen = await render(<ThemeToggle />);

    await screen.getByRole("button", { name: "Switch to dark mode" }).click();
    await expect
      .element(screen.getByRole("button", { name: "Switch to light mode" }))
      .toBeVisible();
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(loadStoredTheme()).toBe("dark");

    await screen.getByRole("button", { name: "Switch to light mode" }).click();
    await expect
      .element(screen.getByRole("button", { name: "Switch to dark mode" }))
      .toBeVisible();
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(loadStoredTheme()).toBe("light");
  });

  test("keeps the stored theme when the system theme changes", async () => {
    storeTheme("light");
    const query = mockSystemTheme(true);
    const screen = await render(<ThemeToggle />);

    await expect
      .element(screen.getByRole("button", { name: "Switch to dark mode" }))
      .toBeVisible();
    query.matches = false;
    query.dispatchEvent(new Event("change"));
    query.matches = true;
    query.dispatchEvent(new Event("change"));
    await expect
      .element(screen.getByRole("button", { name: "Switch to dark mode" }))
      .toBeVisible();
  });
});
