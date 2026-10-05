// @ts-check
import { defineConfig } from 'astro/config';
import cspHeaders from './integrations/csp-headers.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://diegor.nl',
  output: 'static',
  compressHTML: true,
  // No prefetch script, and no <ClientRouter /> anywhere, so no view-transitions runtime either.
  prefetch: false,
  // Scope with a class instead of a data-astro-cid-* attribute: slightly smaller HTML.
  scopedStyleStrategy: 'class',
  build: {
    inlineStylesheets: 'always',
  },
  integrations: [cspHeaders()],
});
