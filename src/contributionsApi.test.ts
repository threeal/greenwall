import { describe, expect, inject, test } from "vitest";
import {
  checkGitHubToken,
  fetchGitHubContributions,
} from "./contributionsApi.ts";

// These tests call the real GitHub API on purpose, to also catch it changing shape.
// They need a GitHub token in the `GITHUB_TOKEN` environment variable.
const token = inject("githubToken");

describe("fetchGitHubContributions", { concurrent: true }, () => {
  test("returns a user's last year of contributions", async () => {
    const contributions = await fetchGitHubContributions("threeal", token);
    expect(contributions.length).toBeGreaterThanOrEqual(365);
    for (const day of contributions) {
      expect(day.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(day.count).toBeGreaterThanOrEqual(0);
      expect([0, 1, 2, 3, 4]).toContain(day.level);
    }
    expect(contributions.some((day) => day.level > 0)).toBe(true);
  });

  test("rejects for a token GitHub doesn't accept", async () => {
    await expect(
      fetchGitHubContributions("threeal", "github_pat_invalid"),
    ).rejects.toThrow("GitHub API responded with 401");
  });

  test("rejects for a user that does not exist", async () => {
    await expect(
      fetchGitHubContributions("this-user-should-not-exist-zzz9999", token),
    ).rejects.toThrow(
      "GitHub user this-user-should-not-exist-zzz9999 doesn't exist",
    );
  });
});

describe("checkGitHubToken", { concurrent: true }, () => {
  test("returns true for a token GitHub accepts", async () => {
    expect(await checkGitHubToken(token)).toBe(true);
  });

  test("returns false for a token GitHub doesn't accept", async () => {
    expect(await checkGitHubToken("github_pat_invalid")).toBe(false);
  });

  test("returns false for a token that can't be sent", async () => {
    expect(await checkGitHubToken("github_pat_✓")).toBe(false);
  });
});
