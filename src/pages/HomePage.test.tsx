import { createMemoryRouter, RouterProvider } from "react-router";
import { beforeEach, describe, expect, inject, test } from "vitest";
import { render } from "vitest-browser-react";
import { storeContributions } from "../contributionsStorage.ts";
import { storeToken } from "../settingsStorage.ts";
import HomePage from "./HomePage.tsx";

/**
 * Renders the home page in a memory router starting at the given path.
 * @param path - The initial path, such as `/` or `/<username>`.
 * @returns The memory router and the rendered screen.
 */
async function renderAt(path: string) {
  const router = createMemoryRouter(
    [{ path: "/:username?", Component: HomePage }],
    { initialEntries: [path] },
  );
  const screen = await render(<RouterProvider router={router} />);
  return { router, screen };
}

/**
 * Stores the GitHub token from the environment, so the page fetches through the GitHub API instead of the rate-limited jogruber API.
 */
function storeGitHubToken() {
  storeToken(inject("githubToken"));
}

/**
 * Lists the tooltips of the grid cells currently visible on the page.
 * @returns The visible cells' tooltips, in grid order.
 */
function visibleTooltips() {
  return [...document.querySelectorAll<HTMLElement>("[data-tooltip]")]
    .filter((cell) => cell.checkVisibility())
    .map((cell) => cell.dataset.tooltip);
}

// These tests call the real contributions APIs on purpose, to also catch the APIs going away or changing shape.
// The jogruber API allows only 10 requests per 10 seconds, so tests that only check the page's behavior fetch through the GitHub API,
// with the token from the `GITHUB_TOKEN` environment variable.
describe("HomePage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test(
    "loads contributions with a GitHub token",
    { timeout: 20_000 },
    async () => {
      storeGitHubToken();
      const { screen } = await renderAt("/threeal");
      await expect
        .element(screen.getByRole("button", { name: "Refresh" }), {
          timeout: 15_000,
        })
        .toBeEnabled();
      await expect
        .element(screen.getByText(/contributions? in the last year/))
        .toBeVisible();
    },
  );

  test(
    "falls back to the jogruber API for a rejected token and refetches when the token changes",
    { timeout: 35_000 },
    async () => {
      storeToken("github_pat_invalid");
      const { screen } = await renderAt("/threeal");
      await expect
        .element(screen.getByRole("button", { name: "Refresh" }), {
          timeout: 15_000,
        })
        .toBeEnabled();
      await expect.element(screen.getByRole("status")).toBeEmptyDOMElement();
      const tooltips = visibleTooltips();

      storeGitHubToken();
      await expect
        .element(screen.getByRole("status"))
        .toHaveTextContent("loading contributions for threeal…");
      expect(visibleTooltips()).toEqual(tooltips);

      await expect
        .element(screen.getByRole("button", { name: "Refresh" }), {
          timeout: 15_000,
        })
        .toBeEnabled();
    },
  );

  test("shows an empty, enabled form when there is no username", async () => {
    const { screen } = await renderAt("/");
    await expect.element(screen.getByRole("textbox")).toHaveValue("");
    await expect.element(screen.getByRole("textbox")).toBeEnabled();
    await expect
      .element(screen.getByRole("button", { name: "View contributions" }))
      .toBeEnabled();
    await expect.element(screen.getByRole("status")).not.toBeInTheDocument();
    await expect
      .element(screen.getByText(/in the last year/))
      .not.toBeInTheDocument();
  });

  test("navigates to the submitted username's path", async () => {
    storeGitHubToken();
    const { router, screen } = await renderAt("/");
    await screen.getByRole("textbox").fill("octocat");
    await screen.getByRole("button", { name: "View contributions" }).click();

    expect(router.state.location.pathname).toBe("/octocat");
    await expect.element(screen.getByRole("textbox")).toHaveValue("octocat");
  });

  test(
    "loads contributions for the username in the path",
    { timeout: 20_000 },
    async () => {
      const { screen } = await renderAt("/threeal");
      await expect.element(screen.getByRole("textbox")).toHaveValue("threeal");
      await expect.element(screen.getByRole("textbox")).toBeEnabled();
      await expect
        .element(screen.getByRole("status"))
        .toHaveTextContent("loading contributions for threeal…");
      await expect
        .element(screen.getByRole("button", { name: "View contributions" }))
        .toBeDisabled();
      await expect
        .element(screen.getByText(/in the last year/))
        .not.toBeInTheDocument();

      await expect
        .element(screen.getByRole("button", { name: "Refresh" }), {
          timeout: 15_000,
        })
        .toBeEnabled();
      await expect.element(screen.getByRole("status")).toBeEmptyDOMElement();
      await expect
        .element(screen.getByText(/contributions? in the last year/))
        .toBeVisible();
    },
  );

  test(
    "shows the stored contributions while loading a fresh page",
    { timeout: 20_000 },
    async () => {
      const today = new Date();
      const date = `${String(today.getFullYear())}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      storeContributions("threeal", [{ date, count: 999, level: 4 }]);
      storeGitHubToken();

      const { screen } = await renderAt("/threeal");
      await expect
        .element(screen.getByRole("status"))
        .toHaveTextContent("loading contributions for threeal…");
      expect(
        visibleTooltips().some((tooltip) =>
          tooltip?.startsWith("999 contributions"),
        ),
      ).toBe(true);
      await expect
        .element(screen.getByText("999 contributions in the last year"))
        .toBeVisible();
      await expect
        .element(screen.getByRole("button", { name: "Refresh" }))
        .toBeDisabled();

      await expect
        .element(screen.getByRole("button", { name: "Refresh" }), {
          timeout: 15_000,
        })
        .toBeEnabled();
    },
  );

  test(
    "refreshes contributions without changing the path or clearing the grid",
    { timeout: 35_000 },
    async () => {
      storeGitHubToken();
      const { router, screen } = await renderAt("/threeal");
      await expect
        .element(screen.getByRole("button", { name: "Refresh" }), {
          timeout: 15_000,
        })
        .toBeEnabled();
      const { key } = router.state.location;
      const tooltips = visibleTooltips();
      expect(
        tooltips.some((tooltip) => !tooltip?.startsWith("No contributions")),
      ).toBe(true);

      await screen.getByRole("button", { name: "Refresh" }).click();
      expect(router.state.location.key).toBe(key);
      await expect
        .element(screen.getByRole("status"))
        .toHaveTextContent("loading contributions for threeal…");
      expect(visibleTooltips()).toEqual(tooltips);
      await expect
        .element(screen.getByRole("button", { name: "Refresh" }))
        .toBeDisabled();

      await expect
        .element(screen.getByRole("button", { name: "Refresh" }), {
          timeout: 15_000,
        })
        .toBeEnabled();
    },
  );

  test(
    "switches to another username without waiting for the current one to load",
    { timeout: 20_000 },
    async () => {
      storeGitHubToken();
      const { router, screen } = await renderAt("/octocat");
      await screen.getByRole("textbox").fill("threeal");
      await screen.getByRole("button", { name: "View contributions" }).click();
      expect(router.state.location.pathname).toBe("/threeal");

      await expect
        .element(screen.getByRole("button", { name: "Refresh" }), {
          timeout: 15_000,
        })
        .toBeEnabled();
    },
  );

  test(
    "shows an error message for a username that does not exist",
    { timeout: 20_000 },
    async () => {
      const { screen } = await renderAt("/this-user-should-not-exist-zzz9999");
      await expect
        .element(screen.getByRole("status"), { timeout: 15_000 })
        .toHaveTextContent(
          "could not load contributions for this-user-should-not-exist-zzz9999",
        );
      await expect
        .element(screen.getByRole("button", { name: "View contributions" }))
        .toBeEnabled();
    },
  );

  test(
    "retries a username that failed to load",
    { timeout: 35_000 },
    async () => {
      const { screen } = await renderAt("/this-user-should-not-exist-zzz9999");
      await expect
        .element(screen.getByRole("status"), { timeout: 15_000 })
        .toHaveTextContent(
          "could not load contributions for this-user-should-not-exist-zzz9999",
        );

      await screen.getByRole("button", { name: "View contributions" }).click();
      await expect
        .element(screen.getByRole("status"))
        .toHaveTextContent(
          "loading contributions for this-user-should-not-exist-zzz9999…",
        );
      await expect
        .element(screen.getByRole("button", { name: "View contributions" }))
        .toBeDisabled();

      await expect
        .element(screen.getByRole("status"), { timeout: 15_000 })
        .toHaveTextContent(
          "could not load contributions for this-user-should-not-exist-zzz9999",
        );
    },
  );
});
