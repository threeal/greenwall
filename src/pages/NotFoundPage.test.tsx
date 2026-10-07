import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import NotFoundPage from "./NotFoundPage";

describe("NotFoundPage", () => {
  test("navigates back home when the button is clicked", async () => {
    const router = createMemoryRouter(
      [
        { path: "/", element: <p>home</p> },
        { path: "*", Component: NotFoundPage },
      ],
      { initialEntries: ["/unknown"] },
    );
    const screen = await render(<RouterProvider router={router} />);

    await expect
      .element(screen.getByText("The page you're looking for doesn't exist."))
      .toBeVisible();
    await screen.getByRole("button", { name: "Go back home" }).click();
    await expect.element(screen.getByText("home")).toBeVisible();
  });
});
