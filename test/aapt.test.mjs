import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { findAapt, readBadging, versionFromName } from '../scripts/lib/aapt.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const downloadsDir = resolve(here, '..', 'public', 'downloads');
// The APK currently shipped on the site (whatever version it is).
const shippedName = readdirSync(downloadsDir).find((f) => /^Dawnly-v.*\.apk$/.test(f));
const shippedApk = join(downloadsDir, shippedName ?? 'missing.apk');

test('versionFromName reads the version from the file name', () => {
  assert.equal(versionFromName('Dawnly-v1.7.5.apk'), '1.7.5');
  assert.equal(versionFromName('app-1.2.3-debug.apk'), '1.2.3');
});

test('versionFromName ignores version-like folders in the path', () => {
  assert.equal(versionFromName(join('releases', '2.0.0', 'build.apk')), null);
});

test('versionFromName returns null when the file name has no version', () => {
  assert.equal(versionFromName('build.apk'), null);
});

test('readBadging returns null when no aapt binary is available', () => {
  assert.equal(readBadging(shippedApk, null), null);
});

test('readBadging returns null when the aapt binary cannot be run', () => {
  assert.equal(readBadging(shippedApk, join(here, 'no-such-aapt-binary')), null);
});

// Uses the real aapt from the Android SDK when it is installed; skipped otherwise.
const aapt = findAapt();
test(
  'readBadging reads package, versionCode and versionName from the shipped APK',
  { skip: aapt ? false : 'aapt not installed' },
  () => {
    const badging = readBadging(shippedApk, aapt);
    assert.ok(badging, 'expected badging output');
    assert.equal(badging.versionName, versionFromName(shippedName));
    assert.ok(badging.packageName);
    assert.ok(badging.versionCode);
  }
);
