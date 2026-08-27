import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import StatusMessage from "./StatusMessage";
import styles from "./StatusMessage.module.css";

test("renders the message with the message style when not an error", async () => {
  const screen = await render(
    <StatusMessage message="loading contributions" isError={false} />,
  );
  await expect.element(screen.getByText("loading contributions")).toBeVisible();
  expect(document.querySelectorAll(`.${styles.message}`)).toHaveLength(1);
  expect(document.querySelectorAll(`.${styles.error}`)).toHaveLength(0);
});

test("renders the message with the error style when it is an error", async () => {
  const screen = await render(
    <StatusMessage message="could not load contributions" isError={true} />,
  );
  await expect
    .element(screen.getByText("could not load contributions"))
    .toBeVisible();
  expect(document.querySelectorAll(`.${styles.error}`)).toHaveLength(1);
  expect(document.querySelectorAll(`.${styles.message}`)).toHaveLength(0);
});
