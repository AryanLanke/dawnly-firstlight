// Reads the app-version / app-apk / app-size meta tags (written by
// scripts/sync-apk.mjs) and fills every place the page shows them.
export function applyAppMeta() {
  const version = document.querySelector('meta[name="app-version"]');
  const apk = document.querySelector('meta[name="app-apk"]');
  const size = document.querySelector('meta[name="app-size"]');
  if (!version || !apk) return;

  document.querySelectorAll('[data-app-version]').forEach(function (el) {
    el.textContent = version.content;
  });
  document.querySelectorAll('[data-app-size]').forEach(function (el) {
    el.textContent = size ? size.content : '';
  });

  const link = document.getElementById('download-btn');
  if (!link) return;
  link.href = 'downloads/' + apk.content;
  link.download = apk.content;
}
