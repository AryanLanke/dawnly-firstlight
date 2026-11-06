import { recordDownload } from './download-api.js';

// Runs inside the "Yes, download it" click, so the browser treats the APK request as user-initiated.
function startDownload() {
  recordDownload();

  const btn = document.getElementById('download-btn');
  const apk = document.createElement('a');
  apk.href = btn.href;
  apk.download = btn.download;
  document.body.appendChild(apk);
  apk.click();
  apk.remove();
}

function closeDownloadDialog() {
  const dialog = document.getElementById('download-dialog');
  if (dialog && dialog.open) dialog.close();
}

function triggerDownload(e) {
  e.preventDefault();

  const dialog = document.getElementById('download-dialog');
  if (dialog && typeof dialog.showModal === 'function') {
    if (!dialog.open) dialog.showModal();
    return;
  }

  if (window.confirm('Android will warn you because this is an APK. Rumor has it we can be trusted — go ahead?')) {
    startDownload();
  }
}

export function initDownload() {
  const button = document.getElementById('download-btn');
  const dialog = document.getElementById('download-dialog');

  if (button) button.addEventListener('click', triggerDownload);

  const cancel = document.getElementById('download-cancel');
  const confirm = document.getElementById('download-confirm');
  if (cancel) cancel.addEventListener('click', closeDownloadDialog);
  if (confirm) {
    confirm.addEventListener('click', function () {
      closeDownloadDialog();
      startDownload();
    });
  }

  if (dialog) {
    dialog.addEventListener('click', function (e) {
      if (e.target === dialog) closeDownloadDialog();
    });
  }
}
