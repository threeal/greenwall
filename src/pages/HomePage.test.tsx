import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import HomePage from "./HomePage";

async function renderAt(path: string) {
  const router = createMemoryRouter(
    [{ path: "/:username?", Component: HomePage }],
    { initialEntries: [path] },
  );
  const screen = await render(<RouterProvider router={router} />);
  return { router, screen };
}

describe("HomePage", () => {
  test("shows an empty, enabled form when there is no username", async () => {
    const { screen } = await renderAt("/");
    await expect.element(screen.getByRole("textbox")).toHaveValue("");
    await expect.element(screen.getByRole("textbox")).toBeEnabled();
  });

  test("navigates to the submitted username's path", async () => {
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
      await expect.element(screen.getByRole("textbox")).toBeDisabled();

      await expect
        .element(screen.getByRole("textbox"), { timeout: 15_000 })
        .toBeEnabled();
      await expect
        .element(screen.getByText(/could not load contributions/))
        .not.toBeInTheDocument();
    },
  );

  test(
    "shows an error message for a username that does not exist",
    { timeout: 20_000 },
    async () => {
      const { screen } = await renderAt("/this-user-should-not-exist-zzz9999");
      await expect
        .element(
          screen.getByText(
            'could not load contributions for "this-user-should-not-exist-zzz9999"',
          ),
          { timeout: 15_000 },
        )
        .toBeVisible();
      await expect.element(screen.getByRole("textbox")).toBeEnabled();
    },
  );
});
