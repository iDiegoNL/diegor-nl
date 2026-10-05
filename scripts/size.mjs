// Builds the site and enforces the first-round-trip budget: dist/index.html,
// with its inlined CSS and JS, must be at most 14 KB once Brotli-compressed.
// Pass --no-build to measure the existing dist/ without rebuilding.
import { spawnSync } from 'node:child_process';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { brotliCompressSync, constants, gzipSync } from 'node:zlib';

const BUDGET = 14 * 1024;
const dist = path.resolve('dist');

if (!process.argv.includes('--no-build')) {
  const build = spawnSync('bun', ['run', 'build'], { stdio: 'inherit', shell: process.platform === 'win32' });
  if (build.status !== 0) process.exit(build.status ?? 1);
}

const kb = (bytes) => `${(bytes / 1024).toFixed(2).padStart(7)} KB`;
const row = (label, bytes) => console.log(`  ${label.padEnd(48)}${kb(bytes)}`);

const html = readFileSync(path.join(dist, 'index.html'));
const brotli = brotliCompressSync(html, {
  params: { [constants.BROTLI_PARAM_QUALITY]: 11, [constants.BROTLI_PARAM_SIZE_HINT]: html.length },
}).length;

console.log('\ndist/index.html');
row('raw', html.length);
row('gzip -9 (reference)', gzipSync(html, { level: 9 }).length);
row(`brotli q11 (budget ${BUDGET / 1024} KB)`, brotli);

const images = readdirSync(dist, { recursive: true })
  .filter((file) => /\.(avif|webp|jpe?g|png|gif|svg|ico)$/i.test(file))
  .sort()
  .map((file) => [file, statSync(path.join(dist, file)).size]);

console.log('\nimages in dist/');
for (const [file, bytes] of images) row(file, bytes);
row('total', images.reduce((sum, [, bytes]) => sum + bytes, 0));

if (brotli > BUDGET) {
  console.error(`\n✗ index.html is ${brotli - BUDGET} bytes over the ${BUDGET}-byte Brotli budget`);
  process.exit(1);
}
console.log(`\n✓ index.html is ${BUDGET - brotli} bytes under budget`);
