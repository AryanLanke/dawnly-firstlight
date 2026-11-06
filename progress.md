# Dawnly progress

Last updated: 5 November 2026

## Status

The website is live at https://dawnly-website.pages.dev.

Cloudflare Pages project: `dawnly-website`
Production D1 database: `dawnly-downloads`
Deployment method: Wrangler direct upload from the project root

The homepage, APK headers, and D1-backed download counter were verified in production. A test increment succeeded.

## Completed today

- Finalized the responsive site in `public/index.html`.
- Dark mode is the default; a visitor's saved light or dark choice is remembered.
- The sky stays fixed during scrolling in both themes.
- Clouds were removed. Day mode now uses black shooting stars with the same staggered timing as night mode.
- Phone screenshots are stored locally at 719 x 1600.
- Replaced the mislabeled 0.1.0 prototype with the signed Dawnly 1.5.4 release at `public/downloads/Dawnly-v1.5.4.apk`.
- Verified the APK: versionCode 14, package `com.aryanlanke.dawnly`, minimum Android 8.0, 3,232,180 bytes (3.2 MB), signed by Aryan Lanke.
- Added the Cloudflare Pages Function at `functions/api/downloads.js`.
- Added the D1 migration at `migrations/0001_create_download_stats.sql`.
- The counter is global and starts at 0. Every confirmed download start increments it atomically, including repeat downloads after an uninstall.
- Added a site-controlled "Yes, download it" / "No, I was too afraid" confirmation before the APK request; the copy is intentionally playful, the count rolls upward one digit step at a time, then the native download starts.
- Removed the four obsolete HTML variants, unused cloud artwork, and temporary test caches.
- Kept the local preview server available at `http://localhost:4173`.
- Stopped feature development for this release.

## Deployment completed

- Created the production D1 database and applied `0001_create_download_stats.sql`.
- Created the Cloudflare Pages project and attached the `DB` binding.
- Deployed the site, Pages Functions, APK, images, and `_headers`.
- Verified the homepage returns HTTP 200.
- Verified the APK returns HTTP 200 with `application/vnd.android.package-archive` and `attachment` headers.
- Verified the counter endpoint returns the stored count, increments on POST, and was reset after initial testing.
- Captured the production desktop page and confirmed the dark-mode design renders correctly.

### Future deployments

```text
npx wrangler@latest pages deploy public --project-name dawnly-website --branch main
```

## Remaining optional configuration

- Cloudflare Web Analytics has not been enabled. It can be enabled from the Pages project's Metrics section.
- The Pages project is deployed by Wrangler direct upload. It is not yet connected to GitHub for automatic deployments.
- No custom domain has been attached; the site currently uses `dawnly-website.pages.dev`.
- The site is pushed to https://github.com/AryanLanke/dawnly-firstlight.

## Known limitations

- The counter records confirmed download starts, not confirmed installations. Counting actual installs would require app telemetry, which conflicts with Dawnly's offline/private design.
- Chrome for Android begins the APK request before it displays its native download prompt. The phone test confirmed that Cancel and Download produce no follow-up network request or page event, so the site cannot observe the native prompt's result.
- To keep the count tied to an explicit user choice, the site asks for its own "Yes, download it" confirmation, records the count, then starts the APK request after a short delay so the rolling number is visible.
- Every confirmed download start counts again, including a repeat download after deleting and reinstalling the app.
- The local Python preview cannot run the Cloudflare Function, so the local counter remains at 0 and logs a 404 for `/api/downloads`. This is expected.
- On a phone, `localhost` refers to the phone itself. Use the PC's current LAN address instead; the previously verified address was `http://192.168.1.8:4173`, but it can change.
- The local Python server does not supply the APK MIME type. Cloudflare supplies it through `public/_headers`.

## Decisions before launch

- The desktop layout currently hides the download counter with the phone-only download area. Decide whether the counter should also appear on desktop.
- The footer links to `/privacy` and `#feedback`, but neither destination currently exists in `public/`. Decide whether to add those pages or remove/redirect the links.
