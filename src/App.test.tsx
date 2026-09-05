import { afterEach, expect, test, vi } from "vitest";
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
  default: ({ message }) => (
    <div data-testid="status" data-message={message}>
      status
    </div>
  ),
}));

vi.mock(import("./components/UsernameForm"), () => ({
  default: ({ initialUsername, loading, onSubmit }) => (
    <div
      data-testid="username-form"
      data-initial-username={initialUsername}
      data-loading={loading}
    >
      <button
        onClick={() => {
          onSubmit("octocat");
        }}
      >
        submit
      </button>
    </div>
  ),
}));

const initialUrl = window.location.href;

afterEach(() => {
  window.history.replaceState(null, "", initialUrl);
});

test("renders an enabled form and no status message when there is no username", async () => {
  const screen = await render(<App username={undefined} />);

  expect(screen.getByTestId("status").query()).toBeNull();
  expect(
    screen.getByTestId("username-form").element().getAttribute("data-loading"),
  ).toBe("false");
});

test("passes the initial username to the username form", async () => {
  const screen = await render(<App username="threeal" />);
  expect(
    screen
      .getByTestId("username-form")
      .element()
      .getAttribute("data-initial-username"),
  ).toBe("threeal");
});

test("updates the url and sets the form to loading when a username is submitted", async () => {
  const screen = await render(<App username={undefined} />);

  await screen.getByRole("button", { name: "submit" }).click();

  expect(new URL(window.location.href).searchParams.get("username")).toBe(
    "octocat",
  );
  expect(
    screen.getByTestId("username-form").element().getAttribute("data-loading"),
  ).toBe("true");
});

test(
  "shows the grid and re-enables the form for a valid username",
  { timeout: 20_000 },
  async () => {
    const screen = await render(<App username="threeal" />);

    expect(
      screen
        .getByTestId("username-form")
        .element()
        .getAttribute("data-loading"),
    ).toBe("true");

    await expect
      .poll(
        () =>
          screen
            .getByTestId("username-form")
            .element()
            .getAttribute("data-loading"),
        { timeout: 15_000 },
      )
      .toBe("false");
    expect(
      screen
        .getByTestId("grid")
        .element()
        .getAttribute("data-contributions-count"),
    ).not.toBe("0");
    expect(screen.getByTestId("status").query()).toBeNull();
  },
);

test(
  "shows an error message and re-enables the form for a username that does not exist",
  { timeout: 20_000 },
  async () => {
    const screen = await render(
      <App username="this-user-should-not-exist-zzz9999" />,
    );

    expect(
      screen
        .getByTestId("username-form")
        .element()
        .getAttribute("data-loading"),
    ).toBe("true");

    await expect
      .poll(() => screen.getByTestId("status").query() !== null, {
        timeout: 15_000,
      })
      .toBe(true);
    expect(
      screen
        .getByTestId("username-form")
        .element()
        .getAttribute("data-loading"),
    ).toBe("false");
    expect(
      screen.getByTestId("status").element().getAttribute("data-message"),
    ).toBe(
      'could not load contributions for "this-user-should-not-exist-zzz9999"',
    );
  },
);
