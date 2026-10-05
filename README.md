# diegor.nl

Single-page personal site for Diego Relyveld, built with Astro as a fully static site and deployed to Cloudflare Pages.

The top priority is speed. The whole page (HTML, CSS and JS) arrives in the first TCP round trip, there is no client framework, and the only other requests are a few small images. The tech-stack icons load only when a case study is opened.

## Commands

The project uses [Bun](https://bun.sh) as its package manager and script runner. Astro itself still runs on Node (≥ 22.12) under `bun run`.

| Command           | What it does                                                                                     |
| ----------------- | ------------------------------------------------------------------------------------------------ |
| `bun install`     | Install dependencies                                                                             |
| `bun run dev`     | Dev server at `http://localhost:4321`                                                            |
| `bun run build`   | Static build into `dist/`; also writes the CSP hashes into `dist/_headers`                       |
| `bun run preview` | Serve `dist/` locally. In Astro 7 this runs as a background daemon; stop it with `bunx astro preview stop` |
| `bun run size`    | Build, then print the Brotli size of `dist/index.html` and every image. Exits 1 if the HTML is over 14 KB |
| `bun run build:worker` | `astro build`, then pack `dist/` into the Worker bundle inputs in `.worker/` |
| `bun run dev:worker` | Build and run the Worker locally with `wrangler dev` (rebuilds on changes) |
| `bun run deploy:worker` | Build and deploy the Worker (needs `bunx wrangler login` once) |
| `bun run types:worker` | Regenerate the Workers runtime types into `worker/worker-configuration.d.ts` (gitignored) |

`bun run size -- --no-build` measures the existing `dist/` without rebuilding.

## Alternative: deploying to Cloudflare Pages

Production runs on the Worker (next section). The same `dist/` still deploys to Pages unchanged if you ever need it.

Git integration:

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

## Deploying as a Cloudflare Worker (production)

`worker/` holds the production deploy target: a Worker on `diegor.nl` that serves the whole site from memory.

### Why

Both are deployed and were measured side by side from Prague (same PRG edge, 6 October 2026). Requests alternated between the two hosts, with a fresh connection and an empty cache each time.

| Median (worst) in ms | Pages | Worker |
| --- | --- | --- |
| Server time per request (TTFB − TLS − 1 RTT), n=30 | 26 (76) | 15 (47) |
| Desktop: TTFB / FCP / LCP / last request done, n=8 | 78 / 128 / 160 / 151 | 68 / 108 / 144 / 136 |
| Mobile: TTFB / FCP / LCP / last request done, n=8 | 72 / 124 / 124 / 122 | 64 / 112 / 112 / 121 |
| HTML on the wire | 11,848 B (edge Brotli) | 9,951 B (q11) |

So the Worker is about 10–20 ms faster to first paint, and its HTML is 1.9 KB smaller. Most of the remaining time is network floor: TCP, TLS and the request take three round trips of about 13 ms each.

Both hosts had a cold outlier. On Pages, a file the edge hadn't served recently once took 230 ms. On the Worker, the first request after deploying took 1.2 s.

### How

1. `scripts/build-worker.mjs` turns every file in `dist/` into a Data module bundled into the Worker script.
2. Text files are pre-compressed at Brotli q11 and gzip -9.
3. Each file's headers are resolved from `dist/_headers` at build time, so the CSP, cache rules and security headers stay identical to Pages.

`worker/index.ts` is a small `fetch` handler:

- It picks the Brotli, gzip or identity body according to `Accept-Encoding` (with `encodeBody: "manual"`, so nothing is re-compressed).
- It answers `If-None-Match` with a 304.
- It serves the 404 page with status 404, redirects `*/index.html`, and only allows `GET`/`HEAD`.

There's no storage hop: every response comes straight out of the isolate's memory. Locally it passes everything the Pages version does: Lighthouse 100 / 100 / 100 / 100 and a clean CSP. Upload size is 256 KiB (177 KiB gzipped).

### Trade-off

Every request runs the Worker, unlike Pages, where static requests are free and unlimited.

- **Workers Free:** 100,000 requests/day. One page view is 4–10 requests (HTML, 3–8 images, plus the icon sprite if a case study is opened). That's roughly 10,000–25,000 page views a day. Over the limit, requests fail rather than fall back.
- **Workers Paid:** $5/month, with 10M requests/month included.

### Deploy

- **From your machine:** run `bunx wrangler login` once, then `bun run deploy:worker`. It rebuilds first, through `build.command` in `worker/wrangler.jsonc`, and deploys to `diegor-nl.<your-subdomain>.workers.dev`.
- **From Git (Workers Builds):** import the repo as a Worker and set the deploy command to `bun run deploy:worker`.
- **Custom domain:** `diegor.nl` is configured in `worker/wrangler.jsonc` (`routes`, with `custom_domain: true`). Cloudflare manages its DNS record.
- **www:** `www.diegor.nl` 301-redirects to `diegor.nl` through a Cloudflare Redirect Rule, using a proxied placeholder record `A www 192.0.2.1`. That's zone configuration, not part of this repo. The redirect happens at the edge, so it never runs the Worker.
- **Zone settings:** keep Email Address Obfuscation and Rocket Loader off for `diegor.nl`. Both inject `/cdn-cgi/` scripts into HTML, which the CSP blocks, and Email Obfuscation would rewrite the `mailto:` links.

The Worker config lives in `worker/wrangler.jsonc`, not the repo root, so a Pages project connected to this repo would keep building unchanged.

### Headers and CSP

`public/_headers` sets:

- immutable caching for `/_astro/*`
- revalidation for HTML
- HSTS (with preload), `nosniff`, a strict referrer policy and a `Permissions-Policy` that turns off unused features
- a strict Content-Security-Policy: `default-src 'none'`, with no `'unsafe-inline'` anywhere

The CSP allows the inline `<style>` and `<script>` blocks by their **sha256 hashes**. `integrations/csp-headers.mjs` is a build-only Astro integration (it ships 0 bytes). After each build it hashes every inline block in `dist/*.html` and writes the hashes into `dist/_headers`. It also fails the build if any `style=""` attribute appears, because hashes can't cover those. If you add inline JS or CSS, nothing else needs to change.

`connect-src 'self'` lets the page fetch its own tech-stack icon sprite (see below). It also keeps Lighthouse's in-page `robots.txt` fetch from being blocked; without it the SEO score drops to 92.

`src/pages/404.astro` exists because, without a top-level `404.html`, Cloudflare Pages treats the site as a SPA and serves the homepage with a `200` for every unknown URL.

## Measured results

Measured on Astro 7.3.5 with `bun run size`. Brotli quality 11 via `node:zlib`.

| Asset | Size |
| --- | --- |
| `dist/index.html`, raw (with all CSS + JS inlined) | 50,811 B |
| `dist/index.html`, gzip -9 | 11.45 KB |
| **`dist/index.html`, Brotli** | **9,951 B (9.72 KB), 4,385 B under the 14 KB budget** |
| Inline CSS / inline JS (raw) | 11.3 KB / 407 B |
| Images on first load, mobile (DPR 1.75) | 9.9 KB (3 AVIFs) |
| Images after scrolling the whole page, mobile | 18.0 KB (8 AVIFs) |
| Images on first load, desktop retina | 21.3 KB (8 AVIFs) |
| All image files in `dist/` (every variant, the OG JPEG and the touch icon) | 114.9 KB in 22 files; most are never downloaded |
| Tech-stack icon sprite, fetched on first case-study expand | 19.0 KB raw, 6.9 KB Brotli |

Requests, measured with puppeteer on Pages-emulated headers:

| Viewport | Requests |
| --- | --- |
| Mobile, first load | **4**: the HTML, header avatar, Fans Holdings logo, hero portrait |
| Desktop, first load | 9: the five lazy logos below the hero (Awoostria plus four employers) fall within Chrome's lazy-load distance, so they load right away. None of them block rendering. |
| After scrolling the whole page | 9 in total |
| Opening a case study | +1, the icon sprite, fetched once for both case studies |

There are no font, CSS, JS, favicon or third-party requests, and nothing render-blocking.

Lighthouse 13.5, run locally against `wrangler pages dev` with the production headers:

| Form factor | Performance | Accessibility | Best Practices | SEO | Metrics |
| --- | --- | --- | --- | --- | --- |
| Mobile | 100 | 100 | 100 | 100 | FCP 0.7 s, LCP 1.0 s, TBT 0 ms, CLS 0 |
| Desktop | 100 | 100 | 100 | 100 | FCP 0.2 s, LCP 0.3 s, TBT 0 ms, CLS 0 |

## How it's built

- `src/pages/index.astro`: page shell, global tokens (CSS custom properties) and base styles, and the one inline script (collapse button + icon loader)
- `src/components/`: `Head`, `SiteHeader`, `Hero` (with the duties cards), `Experience`, `CaseStudy` (used for both FansAPI and Awoostria), `Archive`, `SiteFooter`. Each has scoped CSS.
- `src/data/content.ts`: all the copy for lists, experience, case studies and the archive. It was extracted programmatically from the design's `renderVals()`, so the text matches it exactly.
- `src/assets/`: the avatar and the six employer logos. They are rendered with `astro:assets` `<Picture>` as an AVIF `<source>` plus a WebP `<img>`.
  - Fixed-size images get a single 2× file (header avatar 72 px, Fans Holdings logo 144 px, Awoostria logo 120 px, the other four employer logos 80 px). Their `width`/`height` attributes reserve space, and CSS sets the display size.
  - The hero portrait uses 400/640/832w with `sizes`. It gets `loading="eager"` and `fetchpriority="high"` because it sits above the fold on desktop.
  - Each logo is a single shared file across all of its placements, so it's fetched once.
- `src/assets/stack-icons.svg`: an SVG sprite with all 28 tech-stack icons, one `<symbol id="si-<slug>">` each, in brand colours.
  - Sources:
    - 24 from [Simple Icons](https://simpleicons.org) 16.34.0 (CC0)
    - AWS (`aws`) and AWS S3 (`awss3`) from svg-logos, via Iconify's `logos` set (CC0)
    - PHPStan from vscode-icons (MIT)
    - Pest's official logomark from pestphp.com
  - The sprite file header credits each source. Paths are rounded to about 1 decimal per 24 viewBox units, with no visible difference at 16 px.
  - `src/data/content.ts` (`stackIcons`) maps each stack label to its slug. It's the design's mapping plus AWS SES & S3, S3-compatible storage, Pest and PHPStan, so every label now has an icon.
  - `wideStackIcons` lists the symbols that aren't square. Right now that's only the AWS wordmark, whose slot is 27 px wide instead of 16.
  - The chips contain `<svg><use href="#si-…">` slots. The sprite is imported with `?url&no-inline`, so it ships as a hashed, immutable `/_astro/` file. The inline script fetches it the first time any case study opens, including via find-in-page, and inlines it at the end of `<body>`.
  - Inlining it in the HTML instead would cost 6.9 KB Brotli, more than the remaining budget, for icons that are hidden until a case study is opened.
  - To add an icon, add a `<symbol id="si-<slug>" viewBox="…">` with the icon's SVG content and map the label in `stackIcons`. If the icon uses gradients, prefix their IDs with the slug. The sprite is hidden as a zero-size box rather than `display:none`, so gradients still paint.
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
  - Bricolage Grotesque: 40.3 KB as a weight-only variable font (75.1 KB with the optical-size axis)
  - Geist Mono 400/500: another 22.6 KB

  That's 4–8× the entire HTML, plus a swap-related layout-shift risk. The headings still use weight 800 and the design's tight tracking.
- **Tech-stack icons load on demand.** The design loaded them from `cdn.simpleicons.org`: 24 unique third-party requests, with no icon for AWS, S3, Pest or PHPStan. They're now one self-hosted SVG sprite (6.9 KB Brotli) that covers all 28. It's fetched the first time a case study opens and inlined as SVG. Without JS, the chips show text only.
- **Expand/collapse.** React state became a native `<details>`. It works without JS, and Chrome's find-in-page opens it. Part of the inline script (407 bytes in total, including the icon loader) powers the bottom "Collapse" button: it closes the section, scrolls back to the top of the case study and returns focus to the toggle.
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
