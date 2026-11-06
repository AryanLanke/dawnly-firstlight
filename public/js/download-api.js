import { setDownloadCount } from './odometer.js';

const ENDPOINT = 'api/downloads';

// Only a non-negative whole number is shown; anything else leaves the page as it is.
function isValidCount(value) {
  return Number.isSafeInteger(value) && value >= 0;
}

export async function loadDownloadCount() {
  try {
    const response = await fetch(ENDPOINT, {
      headers: { Accept: 'application/json' }
    });
    if (!response.ok) return;
    const data = await response.json();
    if (isValidCount(data.count)) setDownloadCount(data.count, false);
  } catch (e) {}
}

export async function recordDownload() {
  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { Accept: 'application/json' }
    });
    if (!response.ok) return;
    const data = await response.json();
    if (isValidCount(data.count)) setDownloadCount(data.count, true);
  } catch (e) {}
}
