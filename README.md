# diegor.nl

Single-page personal site for Diego Relyveld, built with Astro as a fully static site and deployed to Cloudflare Pages.

The top priority is speed. The whole page (HTML, CSS and JS) arrives in the first TCP round trip, there is no client framework, and the only other requests are a few small images.

## Commands

The project uses [Bun](https://bun.sh) as its package manager and script runner. Astro itself still runs on Node (≥ 22.12) under `bun run`.

| Command           | What it does                                                                                     |
| ----------------- | ------------------------------------------------------------------------------------------------ |
| `bun install`     | Install dependencies                                                                             |
| `bun run dev`     | Dev server at `http://localhost:4321`                                                            |
| `bun run build`   | Static build into `dist/`; also writes the CSP hashes into `dist/_headers`                       |
| `bun run preview` | Serve `dist/` locally. In Astro 7 this runs as a background daemon; stop it with `bunx astro preview stop` |
| `bun run size`    | Build, then print the Brotli size of `dist/index.html` and every image. Exits 1 if the HTML is over 14 KB |

`bun run size -- --no-build` measures the existing `dist/` without rebuilding.

## Deploying to Cloudflare Pages

Git integration (recommended):

- Framework preset: **Astro** (or none)
- Build command: `bun run build`
- Build output directory: `dist`
- Pages detects Bun from `bun.lock`. If the build image's Node is older than 22.12, set the `NODE_VERSION` environment variable (for example `24`).

Direct upload from your machine:

```sh
bun run build
bunx wrangler pages deploy dist --project-name diegor-nl
```

To test the real headers locally (the CSP, cache rules and 404 handling), run `bunx wrangler pages dev dist`. Restart it after every build: it does not reload `_headers`.

### Headers and CSP

`public/_headers` sets:

- immutable caching for `/_astro/*`
- revalidation for HTML
- HSTS (with preload), `nosniff`, a strict referrer policy and a `Permissions-Policy` that turns off unused features
- a strict Content-Security-Policy: `default-src 'none'`, with no `'unsafe-inline'` anywhere

The CSP allows the inline `<style>` and `<script>` blocks by their **sha256 hashes**. `integrations/csp-headers.mjs` is a build-only Astro integration (it ships 0 bytes). After each build it hashes every inline block in `dist/*.html` and writes the hashes into `dist/_headers`. It also fails the build if any `style=""` attribute appears, because hashes can't cover those. If you add inline JS or CSS, nothing else needs to change.

`connect-src 'self'` is in the policy only so that Lighthouse's in-page `robots.txt` fetch isn't blocked. Without it the SEO score drops to 92.

`src/pages/404.astro` exists because, without a top-level `404.html`, Cloudflare Pages treats the site as a SPA and serves the homepage with a `200` for every unknown URL.

## Measured results

Measured on Astro 7.3.5 with `bun run size`. Brotli quality 11 via `node:zlib`.

| Asset | Size |
| --- | --- |
| `dist/index.html`, raw (with all CSS + JS inlined) | 46,493 B |
| `dist/index.html`, gzip -9 | 11.04 KB |
| **`dist/index.html`, Brotli** | **9,573 B (9.35 KB), 4,763 B under the 14 KB budget** |
| Inline CSS / inline JS (raw) | 11.6 KB / 204 B |
| Images on first load, mobile (DPR 1.75) | 10.2 KB (3 AVIFs) |
| Images after scrolling the whole page, mobile | 18.4 KB (8 AVIFs) |
| Images on first load, desktop retina | 21.8 KB (8 AVIFs) |
| All image files in `dist/` (every variant, the OG JPEG and the touch icon) | 117.7 KB in 22 files; most are never downloaded |

Requests, measured with puppeteer on Pages-emulated headers:

| Viewport | Requests |
| --- | --- |
| Mobile, first load | **4**: the HTML, header avatar, Fans Holdings logo, hero portrait |
| Desktop, first load | 9: the five lazy logos below the hero (Awoostria plus four employers) fall within Chrome's lazy-load distance, so they load right away. None of them block rendering. |
| After scrolling the whole page | 9 in total |

There are no font, CSS, JS, favicon or third-party requests, and nothing render-blocking.

Lighthouse 13.5, run locally against `wrangler pages dev` with the production headers:

| Form factor | Performance | Accessibility | Best Practices | SEO | Metrics |
| --- | --- | --- | --- | --- | --- |
| Mobile | 100 | 100 | 100 | 100 | FCP 0.7 s, LCP 1.0 s, TBT 0 ms, CLS 0 |
| Desktop | 100 | 100 | 100 | 100 | FCP 0.2 s, LCP 0.3 s, TBT 0 ms, CLS 0 |

## How it's built

- `src/pages/index.astro`: page shell, global tokens (CSS custom properties) and base styles, and the one inline script
- `src/components/`: `Head`, `SiteHeader`, `Hero` (with the duties cards), `Experience`, `CaseStudy` (used for both FansAPI and Awoostria), `Archive`, `SiteFooter`. Each has scoped CSS.
- `src/data/content.ts`: all the copy for lists, experience, case studies and the archive. It was extracted programmatically from the design's `renderVals()`, so the text matches it exactly.
- `src/assets/`: the avatar and the six employer logos. They are rendered with `astro:assets` `<Picture>` as an AVIF `<source>` plus a WebP `<img>`.
  - Fixed-size images get a single 2× file (header avatar 72 px, Fans Holdings logo 144 px, Awoostria logo 120 px, the other four employer logos 80 px). Their `width`/`height` attributes reserve space, and CSS sets the display size.
  - The hero portrait uses 400/640/832w with `sizes`. It gets `loading="eager"` and `fetchpriority="high"` because it sits above the fold on desktop.
  - Each logo is a single shared file across all of its placements, so it's fetched once.
- `public/apple-touch-icon.png`: 180×180 palette PNG generated from the avatar:
  `node -e 'require("sharp")("src/assets/avatar.jpeg").resize(180,180).png({palette:true,quality:90,effort:10,compressionLevel:9}).toFile("public/apple-touch-icon.png")'`
- Favicon: an inline SVG data URI in `<head>`, so no request.
- Config (`astro.config.mjs`):
  - `output: 'static'`, `compressHTML: true`, `build.inlineStylesheets: 'always'`
  - `prefetch: false`, and no `<ClientRouter />`, so no view transitions
  - `scopedStyleStrategy: 'class'`: about 2.4 KB less raw HTML than the default `data-astro-cid-*` attributes

### `design/`

`design/` holds the Claude Design export: `Redesign C - Bright.dc.html`, `support.js` and the source images. It's a read-only reference. Nothing imports it, it's excluded from `tsconfig.json`, and it never reaches `dist/`.

`support.js` is Claude Design's React-based template runtime, not site code. The design tool caps file downloads at 256 KiB, so `avatar.jpeg` came back truncated. The full file was taken from `iDiegoNL/personal-site` (the repo the design project syncs with) and verified byte-identical to the truncated prefix.

## What changed from the design for speed

- **Fonts.** The design loads Bricolage Grotesque (opsz + wght 400–800) and Geist Mono from Google Fonts. The site uses a `system-ui` stack and `ui-monospace` instead. Measured cost of self-hosting them as Latin-only WOFF2:
  - Bricolage Grotesque: 41.2 KB as a weight-only variable font (76.9 KB with the optical-size axis)
  - Geist Mono 400/500: another 23.1 KB

  That's 4–8× the entire HTML, plus a swap-related layout-shift risk. The headings still use weight 800 and the design's tight tracking.
- **Tech-stack icons dropped.** The chips loaded logos from `cdn.simpleicons.org` (24 unique third-party requests once both case studies are expanded). They're text-only now.
- **Expand/collapse.** React state became a native `<details>`. It works without JS, and Chrome's find-in-page opens it. A 204-byte inline script powers the bottom "Collapse" button: it closes the section, scrolls back to the top of the case study and returns focus to the toggle.
- **Logos that could be inline SVG.** Both are simple enough: the FansAPI `>_` mark is a rounded square, a gradient and two strokes, and the Awoostria wolf is one flat silhouette. They're kept as raster (1.9 KB and 2.7 KB AVIF) for now. Inlining them would save two requests but add their path data to the HTML.

### Smaller deviations

- **Contrast.** The faint grey `#7a7684` (dates, archive years, archive group titles) is darkened to `#6c6876` to pass WCAG AA at 12–13 px.
- **Arrows.** ↗ ↓ ↑ are CSS pseudo-elements with empty alt text, so screen readers don't announce them, and a no-break space keeps them attached to their label.
- **Mobile header.** Below 720 px the nav moves under the name and the "Get in touch" button, and nav padding shrinks so it fits on one row.
- **Accessibility markup.**
  - Stats and duties use `<dl>`. Each label comes first in the DOM, but the number still shows on top.
  - The `awoostria.at` inline link is underlined.
  - There's a skip link and visible `:focus-visible` rings.
  - Smooth scrolling only applies under `prefers-reduced-motion: no-preference`.
