# Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- "Download started" toast after "Yes, download it": an arrow drops and turns into a tick. The APK request now starts just after the tick, so Chrome's own download prompt no longer hides it.
- Smooth dark-mode GIFs of the site on desktop and phone in the README.
- README, MIT license, changelog, security policy, and architecture and operations guides.
- Privacy policy page at `/privacy`.
- `.editorconfig` and `.gitattributes`.
- Same-origin check on `POST /api/downloads`: requests from other websites are rejected with 403.
- Pinned `wrangler` dev dependency, plus `dev` and `db:migrate:*` npm scripts.

### Changed
- Split the 1,500-line `index.html` into per-section CSS files (`public/css/`) and ES modules (`public/js/`).
- Moved the logo into `public/images/logo.svg` instead of repeating it inline.
- Split the counter function into `functions/api/downloads.js` plus helpers in `server/`.
- Split `scripts/sync-apk.mjs` into focused modules under `scripts/lib/`.
- The footer Feedback link now opens an email instead of pointing nowhere.
- Deploys use the pinned local Wrangler instead of `wrangler@latest`.

### Removed
- `progress.md`, replaced by the docs above.
- Local `.wrangler/` cache and a stale `.gitignore` rule.

## [1.6.5] - 2026-11-06

### Added
- Dawnly app 1.6.5 (versionCode 16), signed with the same certificate as 1.5.4.
- The site version is read from the APK by `scripts/sync-apk.mjs`, so it is never typed by hand.

### Changed
- Crossfade between light and dark themes instead of switching instantly.
- Broadened the hero subtext beyond wake-up alarms.

## Earlier

- Cloudflare Pages deployment with a D1-backed download counter and a "Yes, download it" confirmation before the APK request.
- Responsive landing page with dark mode by default, a fixed sky background, and shooting stars.
