import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import HomePage from "./HomePage";

function renderAt(path: string) {
  const router = createMemoryRouter([{ path: "/", Component: HomePage }], {
    initialEntries: [path],
  });
  return render(<RouterProvider router={router} />);
}

describe("HomePage", () => {
  test("prompts to set the username when the search parameter is missing", async () => {
    const screen = await renderAt("/");
    await expect
      .element(
        screen.getByText(
          'set the "username" search parameter to see contributions',
        ),
      )
      .toBeVisible();
  });

  test("prompts to set the username when the search parameter is blank", async () => {
    const screen = await renderAt("/?username=%20%20");
    await expect
      .element(
        screen.getByText(
          'set the "username" search parameter to see contributions',
        ),
      )
      .toBeVisible();
  });

  test(
    "loads contributions for the trimmed username from the search parameter",
    { timeout: 20_000 },
    async () => {
      const screen = await renderAt("/?username=%20threeal%20");
      await expect
        .element(screen.getByText('loading contributions for "threeal"'))
        .toBeVisible();
      await expect
        .element(screen.getByText('loading contributions for "threeal"'), {
          timeout: 15_000,
        })
        .not.toBeInTheDocument();
    },
  );
});
