import { expect, test } from "vitest";
import { renderHook } from "vitest-browser-react";
import { useContributions } from "./useContributions";

test("returns a prompt to set the username when there is no username", async () => {
  const { result } = await renderHook(() => useContributions(undefined));

  expect(result.current.message).toBe(
    'set the "username" search parameter to see contributions',
  );
  expect(result.current.isError).toBe(false);
  expect(result.current.contributions).toEqual([]);
});

test(
  "reports loading, then returns contributions, for a valid username",
  { timeout: 20_000 },
  async () => {
    const { result } = await renderHook(() => useContributions("threeal"));

    expect(result.current.message).toBe('loading contributions for "threeal"');
    expect(result.current.isError).toBe(false);

    await expect
      .poll(() => result.current.message, { timeout: 15_000 })
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

    expect(result.current.message).toBe(
      'loading contributions for "this-user-should-not-exist-zzz9999"',
    );
    expect(result.current.isError).toBe(false);

    await expect
      .poll(() => result.current.isError, { timeout: 15_000 })
      .toBe(true);
    expect(result.current.message).toBe(
      'could not load contributions for "this-user-should-not-exist-zzz9999"',
    );
  },
);
