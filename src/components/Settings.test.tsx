import { afterEach, describe, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import Settings from "./Settings.tsx";

afterEach(() => {
  delete document.documentElement.dataset.dark;
});

describe("Settings", () => {
  test("opens and closes the settings panel", async () => {
    const screen = await render(<Settings initialDarkMode={false} />);

    await screen.getByRole("button", { name: "Settings" }).click();
    await expect
      .element(screen.getByRole("dialog", { name: "Settings" }))
      .toBeVisible();

    await screen.getByRole("button", { name: "Close settings" }).click();
    await expect
      .element(screen.getByRole("dialog", { name: "Settings" }))
      .not.toBeInTheDocument();
  });

  test("switches to dark mode when chosen in light mode", async () => {
    const screen = await render(<Settings initialDarkMode={false} />);
    await screen.getByRole("button", { name: "Settings" }).click();
    const select = screen.getByRole("combobox", { name: "Theme" });
    await expect.element(select).toHaveValue("light");

    await select.selectOptions("Dark");
    await expect.element(select).toHaveValue("dark");
    expect(document.documentElement.dataset.dark).toBe("true");
  });

  test("switches to light mode when chosen in dark mode", async () => {
    const screen = await render(<Settings initialDarkMode={true} />);
    await screen.getByRole("button", { name: "Settings" }).click();
    const select = screen.getByRole("combobox", { name: "Theme" });
    await expect.element(select).toHaveValue("dark");

    await select.selectOptions("Light");
    await expect.element(select).toHaveValue("light");
    expect(document.documentElement.dataset.dark).toBe("false");
  });
});
