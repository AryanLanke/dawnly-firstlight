const TICK_MS = 1600;     // matches the drawCheck delay in css/toast.css
const VISIBLE_MS = 3800;
const LEAVE_MS = 350;
let timers = [];

function later(fn, ms) {
  timers.push(setTimeout(fn, ms));
}

// Drops the toast in from the top: "Starting download…" with a falling arrow,
// then "Download started" with a tick, then slides it away.
export function showDownloadToast() {
  const toast = document.getElementById('download-toast');
  const title = document.getElementById('download-toast-title');
  if (!toast) return;

  timers.forEach(clearTimeout);
  timers = [];
  toast.classList.remove('is-visible', 'is-leaving');
  if (title) title.textContent = 'Starting download…';
  toast.hidden = false;
  void toast.offsetWidth; // restart the animations if it's shown again
  toast.classList.add('is-visible');

  later(function () {
    if (title) title.textContent = 'Download started';
  }, TICK_MS);

  later(function () {
    toast.classList.add('is-leaving');
    later(function () {
      toast.hidden = true;
      toast.classList.remove('is-visible', 'is-leaving');
    }, LEAVE_MS);
  }, VISIBLE_MS);
}
