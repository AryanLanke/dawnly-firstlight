# Dawnly progress

Last updated: 4 November 2026

## Status

The website is feature-complete. Production deployment is the remaining work.

Aryan will handle the Cloudflare login, project and database setup, and final link publication. The site must not be deployed or connected without Aryan present.

## Completed today

- Finalized the responsive site in `public/index.html`.
- Dark mode is the default; a visitor's saved light or dark choice is remembered.
- The sky stays fixed during scrolling in both themes.
- Clouds were removed. Day mode now uses black shooting stars with the same staggered timing as night mode.
- Phone screenshots are stored locally at 719 x 1600.
- Added the real Dawnly 1.5.4 APK at `public/downloads/Dawnly-v1.5.4.apk`.
- Verified the APK size as 2,995,680 bytes, or 2.99568 MB. The site correctly displays 3.0 MB.
- Added the Cloudflare Pages Function at `functions/api/downloads.js`.
- Added the D1 migration at `migrations/0001_create_download_stats.sql`.
- The counter is global and starts at 0. Every successful download click increments it atomically, including repeat downloads after an uninstall.
- Removed the four obsolete HTML variants, unused cloud artwork, and temporary test caches.
- Kept the local preview server available at `http://localhost:4173`.
- Stopped feature development for this release.

## Tomorrow: 5 November 2026

Goal: publish Dawnly on Cloudflare Pages with the D1 download counter working in production.

### Aryan's steps

1. Log in to Cloudflare in the browser.
2. Create a D1 database named `dawnly-downloads`.
3. Copy its real database ID into `wrangler.toml`, replacing `REPLACE_WITH_YOUR_D1_DATABASE_ID`.
4. Apply the migration to the production database:
   `npx wrangler d1 migrations apply dawnly-downloads --remote`
5. Create the Cloudflare Pages project named `dawnly-website`.
6. Deploy from the project root with Wrangler so the `public/` site and `functions/` API are uploaded together.
7. Add the Pages project's D1 binding with variable name `DB` if it is not picked up from `wrangler.toml` automatically.
8. Attach the final domain or use the generated `*.pages.dev` address, then publish the link.

### Production checks

- Open the published site over HTTPS on a phone and desktop.
- Confirm the page loads with dark mode by default and the theme choice survives a reload.
- Confirm all three shooting stars work in both themes and the sky does not move during scrolling.
- Request `GET /api/downloads`; the initial count should be 0.
- Download the APK and confirm the file is exactly 2,995,680 bytes and has an `.apk` filename.
- Download from two separate browsers or devices and confirm the shared count becomes 2.
- Download again from either browser and confirm the shared count becomes 3.
- Confirm the APK still downloads if the counter API is temporarily unavailable.

### Definition of done

- The public HTTPS link loads the complete site.
- The APK installs after the normal Android unknown-source confirmation.
- The download counter is visible on phones and updates globally across devices.
- No production console errors or missing asset requests remain.
- The final link is recorded in this file.

## Pending configuration

- `wrangler.toml` still contains the placeholder D1 database ID.
- The Cloudflare Pages project, production database, D1 binding, and custom domain do not exist yet.
- No production deployment has been performed.
- Nothing has been pushed to a remote Git repository.

## Known limitations

- The counter records download starts, not confirmed installations. Counting actual installs would require app telemetry, which conflicts with Dawnly's offline/private design.
- Every successful download click counts again, including a repeat download after deleting and reinstalling the app.
- The local Python preview cannot run the Cloudflare Function, so the local counter remains at 0 and logs a 404 for `/api/downloads`. This is expected.
- On a phone, `localhost` refers to the phone itself. Use the PC's current LAN address instead; the previously verified address was `http://192.168.1.8:4173`, but it can change.
- The local Python server does not supply the APK MIME type. Cloudflare supplies it through `public/_headers`.

## Decisions before launch

- The desktop layout currently hides the download counter with the phone-only download area. Decide whether the counter should also appear on desktop.
- The footer links to `/privacy` and `#feedback`, but neither destination currently exists in `public/`. Decide whether to add those pages or remove/redirect the links.
