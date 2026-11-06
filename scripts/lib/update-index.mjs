import { readFileSync, writeFileSync } from 'node:fs';

// Writes version, file name and size into the meta tags and the static download link.
export function updateIndex(indexPath, { version, fileName, sizeLabel }) {
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
}
