import { useState } from "react";
import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import UsernameForm from "./UsernameForm.tsx";

/**
 * Renders the username form with its input text kept in local state.
 * @param props - The component props.
 * @param props.defaultValue - The text initially shown in the input.
 * @param props.loadedUsername - The user whose contributions are loaded, if any.
 * @param props.loadingUsername - The user whose contributions are loading, if any.
 * @param props.onSubmit - Called with the submitted username.
 * @returns The username form.
 */
function StatefulUsernameForm({
  defaultValue,
  loadedUsername,
  loadingUsername,
  onSubmit,
}: {
  defaultValue: string;
  loadedUsername?: string;
  loadingUsername?: string;
  onSubmit: (username: string) => void;
}) {
  const [value, setValue] = useState(defaultValue);

  return (
    <UsernameForm
      value={value}
      onValueChange={setValue}
      loadedUsername={loadedUsername}
      loadingUsername={loadingUsername}
      onSubmit={onSubmit}
    />
  );
}

test("shows the given value in the input", async () => {
  const screen = await render(
    <StatefulUsernameForm defaultValue="threeal" onSubmit={vi.fn()} />,
  );
  await expect.element(screen.getByRole("textbox")).toHaveValue("threeal");
});

test("calls onSubmit with the trimmed username when submitted", async () => {
  const onSubmit = vi.fn();
  const screen = await render(
    <StatefulUsernameForm defaultValue="" onSubmit={onSubmit} />,
  );
  await screen.getByRole("textbox").fill("  octocat  ");
  await screen.getByRole("button", { name: "View contributions" }).click();
  expect(onSubmit).toHaveBeenCalledExactlyOnceWith("octocat");
});

test("does not call onSubmit when the input is blank", async () => {
  const onSubmit = vi.fn();
  const screen = await render(
    <StatefulUsernameForm defaultValue="" onSubmit={onSubmit} />,
  );
  await screen.getByRole("textbox").fill("   ");
  await screen.getByRole("button", { name: "View contributions" }).click();
  expect(onSubmit).not.toHaveBeenCalled();
});

test("disables the button only while the input matches the loading user", async () => {
  const screen = await render(
    <StatefulUsernameForm
      defaultValue="threeal"
      loadingUsername="threeal"
      onSubmit={vi.fn()}
    />,
  );
  await expect.element(screen.getByRole("textbox")).toBeEnabled();
  await expect
    .element(screen.getByRole("button", { name: "View contributions" }))
    .toBeDisabled();

  await screen.getByRole("textbox").fill("octocat");
  await expect
    .element(screen.getByRole("button", { name: "View contributions" }))
    .toBeEnabled();
});

test("shows a refresh button while the input matches the loaded user", async () => {
  const screen = await render(
    <StatefulUsernameForm
      defaultValue="threeal"
      loadedUsername="threeal"
      onSubmit={vi.fn()}
    />,
  );
  await expect
    .element(screen.getByRole("button", { name: "Refresh" }))
    .toBeEnabled();

  await screen.getByRole("textbox").fill("octocat");
  await expect
    .element(screen.getByRole("button", { name: "View contributions" }))
    .toBeEnabled();
});

test("disables the refresh button while the loaded user is reloading", async () => {
  const screen = await render(
    <StatefulUsernameForm
      defaultValue="threeal"
      loadedUsername="threeal"
      loadingUsername="threeal"
      onSubmit={vi.fn()}
    />,
  );
  await expect
    .element(screen.getByRole("button", { name: "Refresh" }))
    .toBeDisabled();
});
