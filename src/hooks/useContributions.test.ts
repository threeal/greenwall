import { expect, test } from "vitest";
import { renderHook } from "vitest-browser-react";
import { useContributions } from "./useContributions";

test("returns no contributions and no status when there is no username", async () => {
  const { result } = await renderHook(() => useContributions(undefined));

  expect(result.current.status).toBeNull();
  expect(result.current.contributions).toEqual([]);
});

test(
  "reports loading, then returns contributions, for a valid username",
  { timeout: 20_000 },
  async () => {
    const { result } = await renderHook(() => useContributions("threeal"));

    expect(result.current.status).toBe("loading");

    await expect
      .poll(() => result.current.status, { timeout: 15_000 })
      .toBeNull();
    expect(result.current.contributions.length).not.toBe(0);
  },
);

test(
  "reports loading, then an error, for a username that does not exist",
  { timeout: 20_000 },
  async () => {
    const { result } = await renderHook(() =>
      useContributions("this-user-should-not-exist-zzz9999"),
    );

    expect(result.current.status).toBe("loading");

    await expect
      .poll(() => result.current.status, { timeout: 15_000 })
      .toBe("error");
  },
);

test("discards a pending fetch once the username is cleared", async () => {
  const { result, rerender } = await renderHook<
    { username: string | undefined },
    ReturnType<typeof useContributions>
  >((props) => useContributions(props?.username), {
    initialProps: { username: "threeal" },
  });
  expect(result.current.status).toBe("loading");

  await rerender({ username: undefined });
  expect(result.current.status).toBeNull();

  await new Promise((resolve) => setTimeout(resolve, 500));
  expect(result.current.status).toBeNull();
  expect(result.current.contributions).toEqual([]);
});
