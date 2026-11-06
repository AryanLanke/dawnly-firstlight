import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { updateIndex } from '../scripts/lib/update-index.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const moduleUrl = pathToFileURL(resolve(here, '..', 'scripts', 'lib', 'update-index.mjs')).href;

const FIXTURE = `<meta content="1.7.5" name="app-version"/>
<meta content="Dawnly-v1.7.5.apk" name="app-apk"/>
<meta content="3.3 MB" name="app-size"/>
<a class="btn-cta" href="downloads/Dawnly-v1.7.5.apk" download="Dawnly-v1.7.5.apk" id="download-btn">
`;

function fixtureFile(contents = FIXTURE) {
  const dir = mkdtempSync(join(tmpdir(), 'dawnly-index-'));
  const path = join(dir, 'index.html');
  writeFileSync(path, contents);
  return path;
}

test('updateIndex rewrites version, APK name, size and both download references', () => {
  const path = fixtureFile();
  updateIndex(path, { version: '1.8.0', fileName: 'Dawnly-v1.8.0.apk', sizeLabel: '4.1 MB' });
  const html = readFileSync(path, 'utf8');

  assert.match(html, /<meta content="1\.8\.0" name="app-version"\/>/);
  assert.match(html, /<meta content="Dawnly-v1\.8\.0\.apk" name="app-apk"\/>/);
  assert.match(html, /<meta content="4\.1 MB" name="app-size"\/>/);
  assert.match(html, /href="downloads\/Dawnly-v1\.8\.0\.apk"/);
  assert.match(html, /download="Dawnly-v1\.8\.0\.apk"/);
  assert.doesNotMatch(html, /1\.7\.5/);
});

test('updateIndex keeps "$" in values literal instead of treating them as replacement patterns', () => {
  const path = fixtureFile();
  updateIndex(path, { version: '2.0.$&', fileName: 'Dawnly-v2.0.$1.apk', sizeLabel: '1 MB' });
  const html = readFileSync(path, 'utf8');

  assert.match(html, /<meta content="2\.0\.\$&" name="app-version"\/>/);
  assert.match(html, /href="downloads\/Dawnly-v2\.0\.\$1\.apk"/);
});

test('updateIndex exits non-zero and leaves the file untouched when a tag is missing', () => {
  const original = FIXTURE.replace(/<meta content="3\.3 MB" name="app-size"\/>\n/, '');
  const path = fixtureFile(original);

  const result = spawnSync(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      `import { updateIndex } from ${JSON.stringify(moduleUrl)};
       updateIndex(process.argv[1], { version: '1.8.0', fileName: 'Dawnly-v1.8.0.apk', sizeLabel: '4 MB' });`,
      path
    ],
    { encoding: 'utf8' }
  );

  assert.equal(result.status, 1);
  assert.match(result.stderr, /Could not update index\.html/);
  assert.equal(readFileSync(path, 'utf8'), original);
});
