import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

declare module "vitest" {
  export interface ProvidedContext {
    /** A GitHub token for tests that call the GitHub API, read from the `GITHUB_TOKEN` environment variable. */
    githubToken: string;
  }
}

export default defineConfig({
  test: {
    provide: { githubToken: process.env.GITHUB_TOKEN ?? "" },
    coverage: {
      enabled: true,
      reporter: "text",
      thresholds: { 100: true },
    },
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: "chromium" }],
    },
  },
});
