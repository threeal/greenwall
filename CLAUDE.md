# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## About This Repository

A single-page React + TypeScript app that displays a GitHub-style contributions grid for a given user.

## Architecture

### Source Files

- **`src/index.tsx`** — Entry point; mounts a `RouterProvider` for `src/router.tsx` into the `#root` element (defined in `index.html`).
- **`src/router.tsx`** — Browser router mapping `/` and `/:username` to `HomePage` and any other path to `NotFoundPage`. Like `index.tsx`, it has no dedicated test — neither is imported during the test run, so neither factors into the coverage threshold; page tests build their own memory router instead.
- **`src/pages/HomePage.tsx`** — Reads the username from the path, composes the contributions grid, username form, and error message from `useContributions`, and navigates to `/<username>` on form submit.
- **`src/pages/NotFoundPage.tsx`** — Shown for unknown paths, with a button back to `/`.
- **`src/components/ContributionsGrid.tsx`** — Renders the contributions grid.
- **`src/components/ErrorMessage.tsx`** — Renders an error message below the page content.
- **`src/components/UsernameForm.tsx`** — GitHub-styled username input and submit button, disabled while loading.
- **`src/components/Button.tsx`**, **`src/components/Description.tsx`** — Shared styled button and paragraph, taken from the react-starter template.
- **`src/hooks/useContributions.ts`** — Hook that fetches and owns contribution data for a given user, and owns the `ContributionDay` type.
- **`src/{components,pages}/*.module.css`** — Stylesheets imported directly into their corresponding component/page files.
- **`src/{components,pages}/*.test.tsx`**, **`src/hooks/*.test.ts`** — Vitest test files co-located with source. `useContributions.test.ts` tests the hook directly with `renderHook`; its data-loading cases, and `HomePage.test.tsx`'s, hit the real jogruber contributions API rather than mocking `fetch`.

### Build Output

- **`dist/`** — Static site produced by `pnpm vite build`; deployed to Cloudflare Pages by CI.
- **`public/_redirects`** — Serves `index.html` for any unmatched path (Cloudflare Pages' native SPA fallback), letting the client-side router handle unknown paths.

## Tooling

### Dependabot

Keeps GitHub Actions and npm dependencies up to date automatically via `.github/dependabot.yaml`.

### ESLint

Linter configured in `eslint.config.ts`.

### GitHub Actions

Automates CI/CD. Workflow files:

- **`.github/workflows/ci.yaml`** — Triggers on push to `main`, pull requests, and manual dispatch. Validates the pre-commit hook, tests, and builds the app.
- **`.github/workflows/deploy.yaml`** — Triggers on push to `main` and manual dispatch. Builds the app and publishes `dist/` to Cloudflare Pages via `wrangler pages deploy` (Direct Upload, not Cloudflare's own Git integration) — requires `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` repo secrets, and a `CLOUDFLARE_PROJECT_NAME` repo variable.

### Lefthook

Git hook manager configured in `lefthook.yaml`.

### pnpm

Package manager. Also manages the Node.js runtime — versions for Node.js and pnpm are pinned in `package.json`.

### Prettier

Formatter configured in `.prettierrc.json` using `prettier-plugin-organize-imports` and `prettier-plugin-css-order` — import order and CSS property order are auto-managed.

### TypeScript

Type checker. `tsconfig.json` (extends `@tsconfig/vite-react`) is used for type checking via `pnpm tsc`. There's no separate build config — Vite transpiles and bundles TypeScript itself without type-checking, so `pnpm tsc` is the only type-safety gate.

### Vite

Dev server and bundler configured in `vite.config.ts`.

### Vitest

Test runner configured in `vitest.config.ts` with 100% coverage threshold required on every test run. Tests run in a real headless Chromium browser via `@vitest/browser-playwright` and `vitest-browser-react`, not jsdom.

## Checking and Fixing

Run the pre-commit hook to check types, formatting, and lint locally:

```sh
lefthook run pre-commit              # staged files only (default)
lefthook run pre-commit --all-files  # all files — matches what CI runs
```

If any file changes during the run, re-stage the changed files and retry.

## Testing

```sh
pnpm vitest run             # Run all tests
pnpm vitest run <file>      # Run a single test file
```

Coverage is always enabled and computed for all files imported during the test run. Running a single test file may fail the 100% threshold if it imports a source file that another test is responsible for fully covering — use the full suite for accurate results.

Tests require Playwright's Chromium shell, installed automatically by the `prepare` script (`playwright install chromium --only-shell`) after `pnpm install`.

## Building and Deploying

Use `pnpm vite build` to produce the production bundle in `dist/`; this is for local verification only. Deployment happens automatically: pushing to `main` triggers `.github/workflows/deploy.yaml`, which builds the app and publishes `dist/` to Cloudflare Pages via Wrangler.
