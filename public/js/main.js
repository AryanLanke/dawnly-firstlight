import { initTheme } from './theme.js';
import { applyAppMeta } from './app-meta.js';
import { initDownload } from './download.js';
import { loadDownloadCount } from './download-api.js';

initTheme();
applyAppMeta();
initDownload();
loadDownloadCount();
