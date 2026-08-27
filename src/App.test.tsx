import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import App from "./App";

vi.mock(import("./components/ContributionsGrid"), () => ({
  default: ({ contributions }) => (
    <div data-testid="grid" data-contributions-count={contributions.length}>
      grid
    </div>
  ),
}));

vi.mock(import("./components/StatusMessage"), () => ({
  default: ({ message, isError }) => (
    <div data-testid="status" data-message={message} data-is-error={isError}>
      status
    </div>
  ),
}));

test("renders a prompt to set the username when there is no username", async () => {
  const screen = await render(<App username={undefined} />);

  await expect.element(screen.getByTestId("status")).toBeVisible();
  const status = screen.getByTestId("status").element();
  expect(status.getAttribute("data-message")).toBe(
    'set the "username" search parameter to see contributions',
  );
  expect(status.getAttribute("data-is-error")).toBe("false");
});

test(
  "shows a loading message, then the grid, for a valid username",
  { timeout: 20_000 },
  async () => {
    const screen = await render(<App username="threeal" />);

    await expect.element(screen.getByTestId("status")).toBeVisible();
    const loading = screen.getByTestId("status").element();
    expect(loading.getAttribute("data-message")).toBe(
      'loading contributions for "threeal"',
    );
    expect(loading.getAttribute("data-is-error")).toBe("false");

    await expect
      .poll(() => screen.getByTestId("status").query(), { timeout: 15_000 })
      .toBeNull();
    expect(
      screen
        .getByTestId("grid")
        .element()
        .getAttribute("data-contributions-count"),
    ).not.toBe("0");
  },
);

test(
  "shows a loading message, then an error, for a username that does not exist",
  { timeout: 20_000 },
  async () => {
    const screen = await render(
      <App username="this-user-should-not-exist-zzz9999" />,
    );

    await expect.element(screen.getByTestId("status")).toBeVisible();
    const loading = screen.getByTestId("status").element();
    expect(loading.getAttribute("data-message")).toBe(
      'loading contributions for "this-user-should-not-exist-zzz9999"',
    );
    expect(loading.getAttribute("data-is-error")).toBe("false");

    await expect
      .poll(
        () =>
          screen.getByTestId("status").element().getAttribute("data-is-error"),
        { timeout: 15_000 },
      )
      .toBe("true");
    const error = screen.getByTestId("status").element();
    expect(error.getAttribute("data-message")).toBe(
      'could not load contributions for "this-user-should-not-exist-zzz9999"',
    );
    expect(error.getAttribute("data-is-error")).toBe("true");
  },
);
