import { afterEach, describe, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { loadSettings } from "../settingsStorage.ts";
import Settings from "./Settings.tsx";

afterEach(() => {
  localStorage.removeItem("settings");
  delete document.documentElement.dataset.dark;
});

describe("Settings", () => {
  test("opens and closes the settings panel", async () => {
    const screen = await render(
      <Settings initialSettings={{ theme: "system" }} />,
    );

    await screen.getByRole("button", { name: "Settings" }).click();
    await expect
      .element(screen.getByRole("dialog", { name: "Settings" }))
      .toBeVisible();

    await screen.getByRole("button", { name: "Close settings" }).click();
    await expect
      .element(screen.getByRole("dialog", { name: "Settings" }))
      .not.toBeInTheDocument();
  });

  test("switches to dark mode when chosen", async () => {
    const screen = await render(
      <Settings initialSettings={{ theme: "system" }} />,
    );
    await screen.getByRole("button", { name: "Settings" }).click();
    const select = screen.getByRole("combobox", { name: "Theme" });
    await expect.element(select).toHaveValue("system");

    await select.selectOptions("Dark");
    await expect.element(select).toHaveValue("dark");
    expect(document.documentElement.dataset.dark).toBe("true");
    expect(loadSettings()).toEqual({ theme: "dark" });
  });

  test("switches to light mode when chosen", async () => {
    const screen = await render(
      <Settings initialSettings={{ theme: "dark" }} />,
    );
    await screen.getByRole("button", { name: "Settings" }).click();
    const select = screen.getByRole("combobox", { name: "Theme" });
    await expect.element(select).toHaveValue("dark");

    await select.selectOptions("Light");
    await expect.element(select).toHaveValue("light");
    expect(document.documentElement.dataset.dark).toBe("false");
    expect(loadSettings()).toEqual({ theme: "light" });
  });

  test("syncs with the system when chosen", async () => {
    document.documentElement.dataset.dark = "true";
    const screen = await render(
      <Settings initialSettings={{ theme: "dark" }} />,
    );
    await screen.getByRole("button", { name: "Settings" }).click();
    const select = screen.getByRole("combobox", { name: "Theme" });

    await select.selectOptions("Sync with system");
    await expect.element(select).toHaveValue("system");
    expect(document.documentElement.dataset.dark).toBeUndefined();
    expect(loadSettings()).toEqual({ theme: "system" });
  });
});
