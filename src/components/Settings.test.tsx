import { afterEach, describe, expect, inject, test } from "vitest";
import { render } from "vitest-browser-react";
import {
  loadTheme,
  loadToken,
  storeTheme,
  storeToken,
} from "../settingsStorage.ts";
import Settings from "./Settings.tsx";

afterEach(() => {
  localStorage.removeItem("theme");
  localStorage.removeItem("token");
  delete document.documentElement.dataset.theme;
});

describe("Settings", () => {
  test("opens and closes the settings panel", async () => {
    const screen = await render(<Settings />);

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
    const screen = await render(<Settings />);
    await screen.getByRole("button", { name: "Settings" }).click();
    const select = screen.getByRole("combobox", { name: "Theme" });
    await expect.element(select).toHaveValue("");

    await select.selectOptions("Dark");
    await expect.element(select).toHaveValue("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(loadTheme()).toBe("dark");
  });

  test("switches to light mode when chosen", async () => {
    storeTheme("dark");
    const screen = await render(<Settings />);
    await screen.getByRole("button", { name: "Settings" }).click();
    const select = screen.getByRole("combobox", { name: "Theme" });
    await expect.element(select).toHaveValue("dark");

    await select.selectOptions("Light");
    await expect.element(select).toHaveValue("light");
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(loadTheme()).toBe("light");
  });

  test("syncs with the system when chosen", async () => {
    document.documentElement.dataset.theme = "dark";
    storeTheme("dark");
    const screen = await render(<Settings />);
    await screen.getByRole("button", { name: "Settings" }).click();
    const select = screen.getByRole("combobox", { name: "Theme" });

    await select.selectOptions("Sync with system");
    await expect.element(select).toHaveValue("");
    expect(document.documentElement.dataset.theme).toBeUndefined();
    expect(loadTheme()).toBe("");
  });

  test("saves a GitHub token", async () => {
    const token = inject("githubToken");
    const screen = await render(<Settings />);
    await screen.getByRole("button", { name: "Settings" }).click();
    const input = screen.getByLabelText("GitHub token");
    const save = screen.getByRole("button", { name: "Save" });
    await expect.element(save).toBeDisabled();

    await input.fill("   ");
    await expect.element(save).toBeDisabled();

    await input.fill(` ${token} `);
    await save.click();
    await expect.element(screen.getByText("A token is saved")).toBeVisible();
    expect(loadToken()).toBe(token);
  });

  test("reports a GitHub token that GitHub rejects", async () => {
    storeToken("github_pat_invalid");
    const screen = await render(<Settings />);
    const button = screen.getByRole("button", { name: "Settings" });
    await expect
      .poll(() => button.element().querySelector("span"))
      .not.toBeNull();

    await button.click();
    await expect
      .element(screen.getByRole("alert"))
      .toHaveTextContent("GitHub rejected this token.");
  });

  test("removes the GitHub token", async () => {
    storeToken("github_pat_invalid");
    const screen = await render(<Settings />);
    await screen.getByRole("button", { name: "Settings" }).click();
    await expect.element(screen.getByRole("alert")).toBeVisible();

    await screen.getByRole("button", { name: "Remove" }).click();
    await expect.element(screen.getByLabelText("GitHub token")).toBeVisible();
    await expect.element(screen.getByRole("alert")).not.toBeInTheDocument();
    expect(
      screen
        .getByRole("button", { name: "Settings", exact: true })
        .element()
        .querySelector("span"),
    ).toBeNull();
    expect(loadToken()).toBe("");
  });
});
