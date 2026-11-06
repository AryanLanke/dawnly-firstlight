import { setDownloadCount } from './odometer.js';

const ENDPOINT = 'api/downloads';

export async function loadDownloadCount() {
  try {
    const response = await fetch(ENDPOINT, {
      headers: { Accept: 'application/json' }
    });
    if (!response.ok) return;
    const data = await response.json();
    setDownloadCount(data.count, false);
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
    setDownloadCount(data.count, true);
  } catch (e) {}
}
