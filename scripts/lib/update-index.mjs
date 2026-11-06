import { readFileSync, writeFileSync } from 'node:fs';

// Writes version, file name and size into the meta tags and the static download link.
export function updateIndex(indexPath, { version, fileName, sizeLabel }) {
  let html = readFileSync(indexPath, 'utf8');
  // Replacer functions keep values literal, so no "$" in a value is read as a group reference.
  const edits = [
    [/(<meta content=")[^"]*(" name="app-version")/, (m, a, b) => a + version + b],
    [/(<meta content=")[^"]*(" name="app-apk")/, (m, a, b) => a + fileName + b],
    [/(<meta content=")[^"]*(" name="app-size")/, (m, a, b) => a + sizeLabel + b],
    [/href="downloads\/Dawnly-v[^"]*\.apk"/g, () => `href="downloads/${fileName}"`],
    [/download="Dawnly-v[^"]*\.apk"/g, () => `download="${fileName}"`]
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
