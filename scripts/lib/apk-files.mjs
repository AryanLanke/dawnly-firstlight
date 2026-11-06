import { copyFileSync, existsSync, readdirSync, rmSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

export function listApks(downloadsDir) {
  return existsSync(downloadsDir)
    ? readdirSync(downloadsDir).filter((name) => name.toLowerCase().endsWith('.apk'))
    : [];
}

// Uses the explicit path if given, otherwise the newest APK in the downloads folder.
export function pickSource(downloadsDir, apks, explicitPath) {
  if (explicitPath) {
    const sourcePath = resolve(explicitPath);
    if (!existsSync(sourcePath)) {
      console.error(`APK not found: ${sourcePath}`);
      process.exit(1);
    }
    return sourcePath;
  }

  if (!apks.length) {
    console.error(`No APK found in ${downloadsDir}. Drop the new build there or pass a path.`);
    process.exit(1);
  }
  const newest = [...apks].sort(
    (a, b) => statSync(join(downloadsDir, b)).mtimeMs - statSync(join(downloadsDir, a)).mtimeMs
  )[0];
  return join(downloadsDir, newest);
}

// Copies the APK to its canonical name and deletes every other APK in the folder.
export function installApk(downloadsDir, sourcePath, fileName, apks) {
  const targetPath = join(downloadsDir, fileName);
  if (sourcePath !== targetPath) copyFileSync(sourcePath, targetPath);

  const removed = [];
  for (const name of apks) {
    if (name === fileName) continue;
    rmSync(join(downloadsDir, name), { force: true });
    removed.push(name);
  }
  return removed;
}
