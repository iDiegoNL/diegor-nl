// Build-only integration (ships zero bytes): hashes every inline <script> and
// <style> Astro emitted and writes those hashes into dist/_headers, so the
// Content-Security-Policy can stay strict without 'unsafe-inline'.
import { createHash } from 'node:crypto';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const sha256 = (text) => `'sha256-${createHash('sha256').update(text).digest('base64')}'`;

/** @returns {import('astro').AstroIntegration} */
export default function cspHeaders() {
  return {
    name: 'csp-headers',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const root = fileURLToPath(dir);
        const pages = (await readdir(root, { recursive: true })).filter((f) => f.endsWith('.html'));
        const scripts = new Set();
        const styles = new Set();

        for (const page of pages) {
          const html = await readFile(path.join(root, page), 'utf8');
          for (const [, body] of html.matchAll(/<script(?![^>]*\ssrc=)[^>]*>([\s\S]*?)<\/script>/g)) scripts.add(sha256(body));
          for (const [, body] of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) styles.add(sha256(body));
          // Hashes don't cover style="" attributes, so fail loudly instead of shipping a broken page.
          if (/<[a-z][^>]*\sstyle=/i.test(html)) throw new Error(`${page}: inline style attribute would be blocked by the CSP`);
        }

        const file = path.join(root, '_headers');
        const headers = await readFile(file, 'utf8');
        await writeFile(
          file,
          headers
            .replaceAll('{{SCRIPT_HASHES}}', [...scripts].join(' ') || "'none'")
            .replaceAll('{{STYLE_HASHES}}', [...styles].join(' ') || "'none'"),
        );
        logger.info(`CSP: ${scripts.size} script hash(es), ${styles.size} style hash(es) written to _headers`);
      },
    },
  };
}
