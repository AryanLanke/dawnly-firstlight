import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const downloadsDir = join(root, 'public', 'downloads');
const indexPath = join(root, 'public', 'index.html');

function compareVersions(a, b) {
  const pa = a.split(/[.-]/).map(Number);
  const pb = b.split(/[.-]/).map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i += 1) {
    const diff = (pa[i] || 0) - (pb[i] || 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

function findAapt() {
  const candidates = [];
  if (process.env.AAPT_PATH) candidates.push(process.env.AAPT_PATH);

  const sdkRoots = [
    process.env.ANDROID_HOME,
    process.env.ANDROID_SDK_ROOT,
    join(homedir(), 'AppData', 'Local', 'Android', 'Sdk'),
    join(homedir(), 'Library', 'Android', 'sdk'),
    join(homedir(), 'Android', 'Sdk')
  ].filter(Boolean);

  for (const sdk of sdkRoots) {
    const buildTools = join(sdk, 'build-tools');
    if (!existsSync(buildTools)) continue;
    const versions = readdirSync(buildTools).sort(compareVersions).reverse();
    for (const version of versions) {
      candidates.push(join(buildTools, version, process.platform === 'win32' ? 'aapt.exe' : 'aapt'));
    }
  }

  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }

  try {
    execFileSync('aapt', ['version'], { stdio: 'ignore' });
    return 'aapt';
  } catch (error) {
    return null;
  }
}

function readBadging(apkPath, aapt) {
  if (!aapt) return null;
  try {
    const output = execFileSync(aapt, ['dump', 'badging', apkPath], { encoding: 'utf8' });
    const match = output.match(/package: name='([^']+)' versionCode='([^']+)' versionName='([^']+)'/);
    if (!match) return null;
    return { packageName: match[1], versionCode: match[2], versionName: match[3] };
  } catch (error) {
    return null;
  }
}

function versionFromName(fileName) {
  const match = fileName.match(/(\d+\.\d+\.\d+)/);
  return match ? match[1] : null;
}

const explicitPath = process.argv[2];
const apks = existsSync(downloadsDir)
  ? readdirSync(downloadsDir).filter((name) => name.toLowerCase().endsWith('.apk'))
  : [];

let sourcePath;
if (explicitPath) {
  sourcePath = resolve(explicitPath);
  if (!existsSync(sourcePath)) {
    console.error(`APK not found: ${sourcePath}`);
    process.exit(1);
  }
} else {
  if (!apks.length) {
    console.error(`No APK found in ${downloadsDir}. Drop the new build there or pass a path.`);
    process.exit(1);
  }
  sourcePath = join(
    downloadsDir,
    apks.sort((a, b) => statSync(join(downloadsDir, b)).mtimeMs - statSync(join(downloadsDir, a)).mtimeMs)[0]
  );
}

const aapt = findAapt();
const badging = readBadging(sourcePath, aapt);
const version = badging ? badging.versionName : versionFromName(sourcePath);
const packageName = badging ? badging.packageName : 'unknown';
const versionCode = badging ? badging.versionCode : 'unknown';

if (!version) {
  console.error('Could not determine the APK version (no aapt and no version in the file name).');
  process.exit(1);
}

const fileName = `Dawnly-v${version}.apk`;
const targetPath = join(downloadsDir, fileName);
const sizeBytes = statSync(sourcePath).size;
const sizeLabel = `${(sizeBytes / 1e6).toFixed(1)} MB`;

if (sourcePath !== targetPath) {
  copyFileSync(sourcePath, targetPath);
}

const removed = [];
for (const name of apks) {
  if (name === fileName) continue;
  rmSync(join(downloadsDir, name), { force: true });
  removed.push(name);
}

let html = readFileSync(indexPath, 'utf8');
const edits = [
  [/(<meta content=")[^"]*(" name="app-version")/, `$1${version}$2`],
  [/(<meta content=")[^"]*(" name="app-apk")/, `$1${fileName}$2`],
  [/(<meta content=")[^"]*(" name="app-size")/, `$1${sizeLabel}$2`],
  [/href="downloads\/Dawnly-v[^"]*\.apk"/g, `href="downloads/${fileName}"`],
  [/download="Dawnly-v[^"]*\.apk"/g, `download="${fileName}"`]
];

for (const [pattern, replacement] of edits) {
  if (!pattern.test(html)) {
    console.error(`Could not update index.html: missing ${pattern}`);
    process.exit(1);
  }
  html = html.replace(pattern, replacement);
}
writeFileSync(indexPath, html);

console.log(`APK:      ${fileName}`);
console.log(`Version:  ${version} (versionCode ${versionCode})`);
console.log(`Package:  ${packageName}`);
console.log(`Size:     ${sizeLabel} (${sizeBytes.toLocaleString('en-US')} bytes)`);
if (removed.length) console.log(`Removed:  ${removed.join(', ')}`);
console.log(`Updated:  public/index.html`);
console.log('');
console.log('Next: npm run deploy');