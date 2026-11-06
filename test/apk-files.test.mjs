import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, utimesSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { installApk, listApks, pickSource, removeOtherApks } from '../scripts/lib/apk-files.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const moduleUrl = pathToFileURL(resolve(here, '..', 'scripts', 'lib', 'apk-files.mjs')).href;

function makeDir(files = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'dawnly-apk-'));
  for (const [name, contents] of Object.entries(files)) {
    writeFileSync(join(dir, name), contents);
  }
  return dir;
}

test('listApks returns only .apk files, matching the extension case-insensitively', () => {
  const dir = makeDir({ 'a.apk': '1', 'B.APK': '2', 'notes.txt': '3', 'c.apk.part': '4' });
  assert.deepEqual(listApks(dir).sort(), ['B.APK', 'a.apk']);
});

test('listApks returns an empty list when the folder does not exist', () => {
  assert.deepEqual(listApks(join(tmpdir(), 'dawnly-does-not-exist-xyz')), []);
});

test('pickSource returns the newest APK by modification time when no path is given', () => {
  const dir = makeDir({ 'old.apk': '1', 'new.apk': '2' });
  utimesSync(join(dir, 'old.apk'), new Date('2025-01-01'), new Date('2025-01-01'));
  utimesSync(join(dir, 'new.apk'), new Date('2026-01-01'), new Date('2026-01-01'));

  const picked = pickSource(dir, listApks(dir), undefined);
  assert.equal(picked, join(dir, 'new.apk'));
});

test('pickSource uses the explicit path when one is given', () => {
  const dir = makeDir({ 'a.apk': '1' });
  const explicit = join(dir, 'a.apk');
  assert.equal(pickSource(dir, listApks(dir), explicit), resolve(explicit));
});

test('pickSource exits with an error when there are no APKs and no path is given', () => {
  const dir = makeDir({ 'readme.txt': 'x' });
  const result = spawnSync(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      `import { pickSource, listApks } from ${JSON.stringify(moduleUrl)};
       const dir = process.argv[1];
       pickSource(dir, listApks(dir), undefined);`,
      dir
    ],
    { encoding: 'utf8' }
  );
  assert.equal(result.status, 1);
  assert.match(result.stderr, /No APK found/);
});

test('installApk copies the source to the canonical name and keeps the original', () => {
  const dir = makeDir({ 'build.apk': 'payload' });
  installApk(dir, join(dir, 'build.apk'), 'Dawnly-v1.8.0.apk');

  assert.equal(readFileSync(join(dir, 'Dawnly-v1.8.0.apk'), 'utf8'), 'payload');
  assert.ok(existsSync(join(dir, 'build.apk')));
});

test('installApk does nothing when the source already has the canonical name', () => {
  const dir = makeDir({ 'Dawnly-v1.8.0.apk': 'payload' });
  assert.doesNotThrow(() => installApk(dir, join(dir, 'Dawnly-v1.8.0.apk'), 'Dawnly-v1.8.0.apk'));
  assert.equal(readFileSync(join(dir, 'Dawnly-v1.8.0.apk'), 'utf8'), 'payload');
});

test('removeOtherApks deletes every APK except the canonical one and reports what it removed', () => {
  const dir = makeDir({
    'Dawnly-v1.8.0.apk': 'keep',
    'Dawnly-v1.7.5.apk': 'old',
    'build.apk': 'stray'
  });
  const apks = listApks(dir);

  const removed = removeOtherApks(dir, apks, 'Dawnly-v1.8.0.apk');

  assert.deepEqual(removed.sort(), ['Dawnly-v1.7.5.apk', 'build.apk']);
  assert.ok(existsSync(join(dir, 'Dawnly-v1.8.0.apk')));
  assert.ok(!existsSync(join(dir, 'Dawnly-v1.7.5.apk')));
  assert.ok(!existsSync(join(dir, 'build.apk')));
});
