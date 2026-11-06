# Architecture

The site is a static page plus one small serverless function and one database table.

```text
 Browser
   |
   |  GET /, /css/*, /js/*, /images/*, /downloads/*.apk
   v
 Cloudflare Pages (static files from public/, headers from public/_headers)
   |
   |  GET or POST /api/downloads
   v
 Pages Function  functions/api/downloads.js
   |   uses server/http.js and server/download-stats.js
   v
 Cloudflare D1 database "dawnly-downloads"
   table download_stats: one row, id = 1, count
```

## Request flow

1. **Page load.** `public/js/main.js` calls `GET /api/downloads`. The function reads `count` from D1 and returns `{"count": N}`. `odometer.js` shows it.
2. **Visitor taps Download APK.** `download.js` opens a confirmation dialog ("Yes, download it" / "No, I was too afraid").
3. **Visitor confirms.** The browser sends `POST /api/downloads`. The function checks the request's `Origin` (requests from other websites, and requests with no `Origin` at all, get 403), then runs one atomic SQL statement, `count = count + 1`, and returns the new total. The number on the page rolls up.
4. **At the same time** a "Starting download…" toast drops in at the top (`toast.js`). Its arrow turns into a tick and the text changes to "Download started".
5. **About 2.1 s later**, just after the tick, the browser fetches `/downloads/Dawnly-vX.Y.Z.apk`. That is a plain static file. `_headers` gives it the Android package content type and `Content-Disposition: attachment`. The toast plays first because Chrome on Android shows its own "Downloading file" bar and "Download anyway?" prompt the moment this request starts.

## What the number means

It counts **confirmed download starts**, meaning the visitor clicked "Yes". It does not count installs.

- Chrome on Android shows its own "Download?" prompt after the request starts, and a website cannot see whether the visitor accepts it.
- Counting installs would need telemetry inside the app, which conflicts with Dawnly's offline and private design.
- Repeat downloads count again, including after an uninstall and reinstall.
- The Origin check blocks other sites, browser forms, and plain tools like curl (which send no `Origin`). It cannot stop a script that sets `Origin` by hand, so treat the total as a friendly indicator, not an audit.

## Privacy of the counter

D1 holds one row with one integer. No IP address, user agent, cookie, or timestamp is stored.

## Code map

| Path | Responsibility |
|---|---|
| `public/index.html` | Landing page markup only |
| `public/css/*.css` | One file per section; `desktop.css` loads last and holds the wide-screen overrides |
| `public/js/theme.js` | Light/dark toggle with view-transition crossfade |
| `public/js/app-meta.js` | Fills version and size from the `app-*` meta tags |
| `public/js/odometer.js` | Renders the rolling digits |
| `public/js/download-api.js` | The two `fetch` calls to `/api/downloads` |
| `public/js/download.js` | Confirmation dialog and starting the APK download |
| `public/js/toast.js` | The "Download started" toast (styles in `css/toast.css`) |
| `functions/api/downloads.js` | `GET` and `POST` handlers |
| `server/http.js` | JSON responses and the Origin check |
| `server/download-stats.js` | The SQL for reading and incrementing the count |
| `scripts/sync-apk.mjs` | Release script; helpers in `scripts/lib/` |

The inline script at the top of `index.html` and `privacy.html` stays inline on purpose. It sets the saved theme before the first paint so the page doesn't flash the wrong colors.

`scripts/lib/update-index.mjs` edits `index.html` with regular expressions that match the `app-version`, `app-apk`, `app-size` meta tags and the `downloads/Dawnly-v….apk` link. Keep those lines in that shape.
