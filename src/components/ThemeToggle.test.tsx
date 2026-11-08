import { afterEach, describe, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import ThemeToggle from "./ThemeToggle.tsx";

afterEach(() => {
  delete document.documentElement.dataset.dark;
});

describe("ThemeToggle", () => {
  test("switches to dark mode when clicked in light mode", async () => {
    const screen = await render(<ThemeToggle initialDarkMode={false} />);

    await screen.getByRole("button", { name: "Switch to dark mode" }).click();
    await expect
      .element(screen.getByRole("button", { name: "Switch to light mode" }))
      .toBeVisible();
    expect(document.documentElement.dataset.dark).toBe("true");
  });

  test("switches to light mode when clicked in dark mode", async () => {
    const screen = await render(<ThemeToggle initialDarkMode={true} />);

    await screen.getByRole("button", { name: "Switch to light mode" }).click();
    await expect
      .element(screen.getByRole("button", { name: "Switch to dark mode" }))
      .toBeVisible();
    expect(document.documentElement.dataset.dark).toBe("false");
  });
});
