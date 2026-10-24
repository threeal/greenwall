# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## About This Repository

A single-page React app that displays a GitHub-style contributions grid for a given user, bundled with Vite and deployed to Cloudflare Pages.

## Gotchas

- `lefthook run pre-commit` skips every job when nothing is staged, even ones that ignore the staged file list — pass `--all-files` to run it outside an actual commit.
- The pre-commit hook fixes files in place, and the run fails if any file changes. Report that failure and leave the fixes for the user to review and re-stage before committing again.
- Vitest's 100% coverage threshold applies to the whole run, not per file — a single test file can fail on source that other tests cover, so run the full suite (`pnpm vitest run`).
- `HomePage.test.tsx` hits the real jogruber contributions API instead of mocking `fetch` — its data-loading tests need network access and can fail from an API outage or rate limit with no code change.
- `.gitignore` ignores every dotfile and dotdir (`.*`) — a new one needs an explicit `!` exception there or it silently won't be tracked.
