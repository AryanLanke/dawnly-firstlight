import { recordDownload } from './download-api.js';

let downloadInProgress = false;

function startDownload() {
  if (downloadInProgress) return;
  downloadInProgress = true;

  const btn = document.getElementById('download-btn');
  const originalHTML = btn.innerHTML;
  btn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4"><polyline points="20 6 9 17 4 12"></polyline></svg> Download started';

  recordDownload();

  setTimeout(() => {
    const apk = document.createElement('a');
    apk.href = btn.href;
    apk.download = btn.download;
    document.body.appendChild(apk);
    apk.click();
    apk.remove();
  }, 620);

  setTimeout(() => {
    btn.innerHTML = originalHTML;
    downloadInProgress = false;
  }, 2400);
}

function closeDownloadDialog() {
  const dialog = document.getElementById('download-dialog');
  if (dialog && dialog.open) dialog.close();
}

function triggerDownload(e) {
  e.preventDefault();
  if (downloadInProgress) return;

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

  document.getElementById('download-cancel').addEventListener('click', closeDownloadDialog);
  document.getElementById('download-confirm').addEventListener('click', function () {
    closeDownloadDialog();
    startDownload();
  });

  if (dialog) {
    dialog.addEventListener('click', function (e) {
      if (e.target === dialog) closeDownloadDialog();
    });
  }
}
