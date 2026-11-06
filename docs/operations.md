# Operations runbook

Cloudflare Pages project: `dawnly-website` · D1 database: `dawnly-downloads` · Live: https://dawnly-website.pages.dev

All commands run from the project root. The first time on a machine, run `npm install` and log in once with `npx wrangler login`.

## Release a new app version

1. Build the signed release APK.
2. Drop it into `public/downloads/`. The file name doesn't matter.
3. `npm run deploy`

The script `scripts/sync-apk.mjs` then:

- reads `versionName`, `versionCode` and the package name from the APK with `aapt`;
- copies the file to `public/downloads/Dawnly-v<version>.apk` and deletes any other APK in that folder;
- writes the version, file name and size into the `app-version`, `app-apk` and `app-size` meta tags in `public/index.html`, and updates the download link.

If `aapt` isn't installed, it falls back to the version in the file name (for example `Dawnly-v1.6.5.apk`). Set `AAPT_PATH` or `ANDROID_HOME` if it can't find `aapt`.

Run `npm run sync-apk` on its own to update the page without deploying. Commit the new APK and `index.html` afterwards.

## Deploy without a new APK

`npm run deploy`. It is safe to repeat.

## Database

| Task | Command |
|---|---|
| Create the table locally | `npm run db:migrate:local` |
| Apply new migrations to production | `npm run db:migrate:remote` |
| Read the production count | `npx wrangler d1 execute dawnly-downloads --remote --command "SELECT count FROM download_stats"` |
| Reset the counter to 0 | `npx wrangler d1 execute dawnly-downloads --remote --command "UPDATE download_stats SET count = 0 WHERE id = 1"` |
| Set the counter to a number | same as above with `SET count = 123` |
| Back up | `npx wrangler d1 export dawnly-downloads --remote --output backups/dawnly.sql` |

`backups/` is git-ignored. D1 Time Travel also lets you restore the database to a point in the last 30 days from the Cloudflare dashboard.

To change the schema, add a new numbered file in `migrations/` (for example `0002_...sql`). Never edit one that has already been applied.

## Local development

```bash
npm run db:migrate:local
npm run dev        # http://localhost:8788
```

The local database lives in `.wrangler/` and is git-ignored. Delete that folder any time to reset it. It is recreated on the next run.

To test on a phone, use the PC's LAN address (for example `http://192.168.1.8:8788`). `localhost` on a phone means the phone itself, and the LAN address can change.

## Limits and costs

Each page view makes one Function call and one D1 read. Each confirmed download adds one D1 write. Cloudflare's free plan allows far more than this site will use, so no paid plan is needed.

## Troubleshooting

- **Counter shows 0 or doesn't change.** Open `/api/downloads` in the browser. A 503 means the `DB` binding is missing from the Pages project (Settings, Functions, D1 bindings: name `DB`, database `dawnly-downloads`). A 500 usually means the migration was not applied: run `npm run db:migrate:remote`.
- **POST returns 403.** The request came from a different origin. This is expected for other sites, and a custom domain needs no change because the check compares against the request's own host.
- **APK downloads as a `.zip` or opens as text.** `public/_headers` wasn't deployed. Redeploy and check that the response has `Content-Type: application/vnd.android.package-archive`.
- **Old version still shows after deploy.** Hard-refresh. The APK is cached for an hour (`Cache-Control: public, max-age=3600`).
- **`sync-apk` fails with "missing ...".** Someone edited the meta tags or the download link in `index.html` out of shape. See the note at the end of [architecture.md](architecture.md).

## Optional next steps

- **Connect GitHub to Cloudflare Pages** for automatic deploys on push. This replaces `npm run deploy`.
- **Custom domain** from the Pages project's Custom domains tab. It also lets you add a Cloudflare rate-limiting rule on `POST /api/downloads`.
- **Web Analytics** from the Pages project's Metrics section. It uses no cookies and shows page views. It is separate from the download counter.

## Known limitations

- The counter records confirmed download starts, not installs. See [architecture.md](architecture.md).
- The local `python -m http.server` preview can't run the Function, so the counter stays at 0 there and logs a 404 for `/api/downloads`. Use `npm run dev` instead.
