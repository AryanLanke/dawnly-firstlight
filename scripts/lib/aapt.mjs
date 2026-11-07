import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { basename, join } from 'node:path';

function compareVersions(a, b) {
  const pa = a.split(/[.-]/).map(Number);
  const pb = b.split(/[.-]/).map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i += 1) {
    const diff = (pa[i] || 0) - (pb[i] || 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

export function findAapt() {
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
  } catch {
    return null;
  }
}

export function readBadging(apkPath, aapt) {
  if (!aapt) return null;
  try {
    const output = execFileSync(aapt, ['dump', 'badging', apkPath], { encoding: 'utf8' });
    const match = output.match(/package: name='([^']+)' versionCode='([^']+)' versionName='([^']+)'/);
    if (!match) return null;
    return { packageName: match[1], versionCode: match[2], versionName: match[3] };
  } catch {
    return null;
  }
}

export function versionFromName(filePath) {
  // Only the file name counts: a version-like folder in the path must not match.
  const match = basename(filePath).match(/(\d+\.\d+\.\d+)/);
  return match ? match[1] : null;
}
