import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import FetchStatus from "./FetchStatus.tsx";

test("shows nothing when idle", async () => {
  const screen = await render(
    <FetchStatus username="threeal" loading={false} error={false} />,
  );
  await expect.element(screen.getByRole("status")).toBeEmptyDOMElement();
});

test("shows the loading user", async () => {
  const screen = await render(
    <FetchStatus username="threeal" loading={true} error={false} />,
  );
  await expect
    .element(screen.getByRole("status"))
    .toHaveTextContent("loading contributions for threeal…");
});

test("shows the user that could not be loaded", async () => {
  const screen = await render(
    <FetchStatus username="threeal" loading={false} error={true} />,
  );
  await expect
    .element(screen.getByRole("status"))
    .toHaveTextContent("could not load contributions for threeal");
});

test("prefers the loading state over a previous error", async () => {
  const screen = await render(
    <FetchStatus username="threeal" loading={true} error={true} />,
  );
  await expect
    .element(screen.getByRole("status"))
    .toHaveTextContent("loading contributions for threeal…");
});
