import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import StatusMessage from "./StatusMessage";

test("renders the message", async () => {
  const screen = await render(
    <StatusMessage message="could not load contributions" />,
  );
  await expect
    .element(screen.getByText("could not load contributions"))
    .toBeVisible();
});
