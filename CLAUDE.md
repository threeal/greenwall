# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## About This Repository

A single-page React app that displays a GitHub-style contributions grid for a given user, bundled with Vite and deployed to Cloudflare Pages.

## Gotchas

- `lefthook run pre-commit` skips every job when nothing is staged, even ones that ignore the staged file list — pass `--all-files` to run it outside an actual commit.
- The pre-commit hook fixes files in place, and the run fails if any file changes. Report that failure and leave the fixes for the user to review and re-stage before committing again.
- Vitest's 100% coverage threshold applies to the whole run, not per file — a single test file can fail on source that other tests cover, so run the full suite (`pnpm vitest run`).
- `HomePage.test.tsx` calls the real jogruber contributions API on purpose, to also check that the API still exists and returns the shape the app expects — don't mock `fetch`. Its data-loading tests need network access, so a failure there may come from an API outage or rate limit rather than a code change. The jogruber API allows only 10 requests per 10 seconds, and a 429 shows up as an ordinary "could not load" — keep the file's jogruber requests well under that by having tests that only check page behavior fetch through the GitHub API with a stored token.
- The tests that call the GitHub API read a GitHub token from the `GITHUB_TOKEN` environment variable (the workflow's built-in token in CI) — without it they fail and coverage drops below 100%. Locally, a fine-grained token can be kept in the git-ignored `.github_token` and passed with `GITHUB_TOKEN=$(cat .github_token) pnpm vitest run`.
- `.gitignore` ignores every dotfile and dotdir (`.*`) — a new one needs an explicit `!` exception there or it silently won't be tracked.
