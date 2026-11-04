// Turns one prerendered page into a single HTML file: styles inlined, scripts removed.
// Usage, after `npm run build`: node scripts/standalone.mjs kb/incidents/4471-split
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const page = process.argv[2];
const html = readFileSync(join('build', `${page}.html`), 'utf8');
const out = html
  .replace(/<link[^>]*rel="stylesheet"[^>]*>/g, (tag) => {
    const href = tag.match(/href="([^"]+)"/)[1].replace(/^(\.\.?\/)+/, '');
    return `<style>${readFileSync(join('build', href), 'utf8')}</style>`;
  })
  .replace(/<link[^>]*rel="modulepreload"[^>]*>/g, '')
  .replace(/<script[\s\S]*?<\/script>/g, '');
const target = join('rendered', `${page}.html`);
mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, out);
console.log(target);
