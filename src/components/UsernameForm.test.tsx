import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import UsernameForm from "./UsernameForm";

test("fills the input with the default username", async () => {
  const screen = await render(
    <UsernameForm
      defaultUsername="threeal"
      loading={false}
      onSubmit={vi.fn()}
    />,
  );
  await expect.element(screen.getByRole("textbox")).toHaveValue("threeal");
});

test("calls onSubmit with the trimmed username when submitted", async () => {
  const onSubmit = vi.fn();
  const screen = await render(
    <UsernameForm
      defaultUsername={undefined}
      loading={false}
      onSubmit={onSubmit}
    />,
  );
  await screen.getByRole("textbox").fill("  octocat  ");
  await screen.getByRole("button", { name: "View contributions" }).click();
  expect(onSubmit).toHaveBeenCalledExactlyOnceWith("octocat");
});

test("does not call onSubmit when the input is blank", async () => {
  const onSubmit = vi.fn();
  const screen = await render(
    <UsernameForm
      defaultUsername={undefined}
      loading={false}
      onSubmit={onSubmit}
    />,
  );
  await screen.getByRole("textbox").fill("   ");
  await screen.getByRole("button", { name: "View contributions" }).click();
  expect(onSubmit).not.toHaveBeenCalled();
});

test("disables the input and shows a loading button when loading", async () => {
  const screen = await render(
    <UsernameForm
      defaultUsername="threeal"
      loading={true}
      onSubmit={vi.fn()}
    />,
  );
  await expect.element(screen.getByRole("textbox")).toBeDisabled();
  await expect
    .element(screen.getByRole("button", { name: "Loading…" }))
    .toBeDisabled();
});
