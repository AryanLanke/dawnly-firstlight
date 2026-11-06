// Reads the newest APK in public/downloads (or the path given as an argument),
// renames it Dawnly-v<version>.apk, removes older APKs, and updates public/index.html.
import { statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { findAapt, readBadging, versionFromName } from './lib/aapt.mjs';
import { installApk, listApks, pickSource } from './lib/apk-files.mjs';
import { updateIndex } from './lib/update-index.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const downloadsDir = join(root, 'public', 'downloads');
const indexPath = join(root, 'public', 'index.html');

const apks = listApks(downloadsDir);
const sourcePath = pickSource(downloadsDir, apks, process.argv[2]);

const badging = readBadging(sourcePath, findAapt());
const version = badging ? badging.versionName : versionFromName(sourcePath);
const packageName = badging ? badging.packageName : 'unknown';
const versionCode = badging ? badging.versionCode : 'unknown';

if (!version) {
  console.error('Could not determine the APK version (no aapt and no version in the file name).');
  process.exit(1);
}

const fileName = `Dawnly-v${version}.apk`;
const sizeBytes = statSync(sourcePath).size;
const sizeLabel = `${(sizeBytes / 1e6).toFixed(1)} MB`;

const removed = installApk(downloadsDir, sourcePath, fileName, apks);
updateIndex(indexPath, { version, fileName, sizeLabel });

console.log(`APK:      ${fileName}`);
console.log(`Version:  ${version} (versionCode ${versionCode})`);
console.log(`Package:  ${packageName}`);
console.log(`Size:     ${sizeLabel} (${sizeBytes.toLocaleString('en-US')} bytes)`);
if (removed.length) console.log(`Removed:  ${removed.join(', ')}`);
console.log(`Updated:  public/index.html`);
console.log('');
console.log('Next: npm run deploy');
