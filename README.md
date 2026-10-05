# diegor.nl

Personal site for Diego Relyveld: a single static page built with Astro and served from a Cloudflare Worker at **https://diegor.nl**.

Speed comes first. The whole page is about 10 KB compressed, with all CSS and JS inlined into the HTML, so it arrives in the first TCP round trip. There's no client framework, no web font and no third-party request. Beyond the HTML, the page loads a few small images, and an icon sprite once a case study is opened.

## Commands

The project uses [Bun](https://bun.sh) as its package manager and script runner. Astro itself still runs on Node (≥ 22.12) under `bun run`.

| Command | What it does |
| --- | --- |
| `bun install` | Install dependencies |
| `bun run dev` | Astro dev server at `http://localhost:4321` |
| `bun run build` | Static build into `dist/`, with the CSP hashes written into `dist/_headers` |
| `bun run preview` | Serve `dist/` with Astro's static server, without the production headers. It runs as a background daemon; stop it with `bunx astro preview stop` |
| `bun run size` | Build, then report the Brotli size of `dist/index.html` and of every image. Exits 1 if the HTML is over 14 KB; `bun run size -- --no-build` skips the build |
| `bun run dev:worker` | Build and run the production Worker locally with `wrangler dev`, including the real headers |
| `bun run deploy:worker` | Build and deploy to production |
| `bun run build:worker` | Build, then pack `dist/` into `.worker/`. The two commands above run it for you |
| `bun run types:worker` | Regenerate the Workers runtime types into `worker/worker-configuration.d.ts` (gitignored) |

## Deploying

Run `bunx wrangler login` once, then `bun run deploy:worker`. That rebuilds the site (through `build.command` in `worker/wrangler.jsonc`) and deploys the `diegor-nl` Worker. The Worker serves `diegor.nl` as a custom domain whose DNS record Cloudflare manages.

Some settings live in the Cloudflare dashboard, not in this repo:

- **Keep Email Address Obfuscation and Rocket Loader off** for `diegor.nl`. Both inject `/cdn-cgi/` scripts that the CSP blocks, and Email Address Obfuscation also rewrites the `mailto:` links.
- **Keep Always Use HTTPS on.** It redirects `http://` to `https://` before the Worker runs.
- **Mind the request limit.** Every request runs the Worker. Workers Free allows 100,000 requests a day, and one page view is 4–10 requests, so that's roughly 10,000–25,000 page views a day. Requests over the limit fail. Workers Paid ($5/month) includes 10M requests a month.

The site is also reachable at `diegor-nl.diegor.workers.dev`. That copy doesn't hurt SEO, because every page's canonical URL points to `diegor.nl`. To turn it off, set `"workers_dev": false` in `worker/wrangler.jsonc`.

## How it's served

`scripts/build-worker.mjs` packs the build into the Worker:

- Every file in `dist/` becomes a Data module inside the Worker bundle, so no request waits on an asset-storage lookup.
- Text files are pre-compressed with Brotli at quality 11 and with gzip -9. The HTML goes out at 9,951 B, versus 11,848 B when Cloudflare compresses it on the fly.
- Headers for each file are resolved from `dist/_headers` at build time.

`worker/index.ts` is a small `fetch` handler:

- It picks the Brotli, gzip or uncompressed body according to `Accept-Encoding`, using `encodeBody: "manual"` so nothing gets compressed twice.
- It answers a matching `If-None-Match` with a 304.
- Unknown paths get the 404 page with a 404 status, `*/index.html` redirects to its directory, and only `GET` and `HEAD` are allowed.

The upload is 256 KiB (177 KiB gzipped).

Cloudflare Pages served the same build side by side from Prague on 6 October 2026. The Worker was 10–20 ms faster to first paint: desktop FCP 108 ms versus 128 ms at the median. Most of the remaining time is network round trips.

## Headers and CSP

`public/_headers` sets:

- **Caching:** `/_astro/*` is immutable for a year. HTML gets `max-age=0, must-revalidate`, and the ETag makes revalidation a 304.
- **Security, on every response:**
  - HSTS: two years, `includeSubDomains`, `preload`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - a `Permissions-Policy` that turns off unused features
  - `Cross-Origin-Opener-Policy: same-origin`
  - `X-Frame-Options: DENY`
- **Content Security Policy:**
  - `default-src 'none'`
  - Inline `<style>` and `<script>` blocks are allowed by their sha256 hashes, with no `'unsafe-inline'`.
  - `connect-src 'self'` lets the page fetch its icon sprite. It also lets Lighthouse read `robots.txt`, without which the SEO score drops to 92.

`integrations/csp-headers.mjs` is a build-only Astro integration that ships no runtime bytes. After each build it:

- hashes every inline block in `dist/*.html`
- fills those hashes into `dist/_headers`
- fails the build if any `style=""` attribute appears, because hashes can't cover those

Adding inline JS or CSS needs no manual change.

Note that `includeSubDomains` applies to every `*.diegor.nl`. Don't submit the domain to hstspreload.org unless every subdomain will always be HTTPS.

## Performance

Measured on production (`https://diegor.nl`), 6 October 2026.

| | Size |
| --- | --- |
| HTML, with all CSS + JS inlined | 50,811 B raw; **9,951 B Brotli**, 4,385 B under the 14 KB budget |
| Inline CSS / inline JS (raw) | 11.3 KB / 407 B |

| Cold cache | Requests | Image bytes |
| --- | --- | --- |
| Mobile, first load | **4**: the HTML, header avatar, Fans Holdings logo, hero portrait | 10.6 KB |
| Desktop, first load | 9: the lazy logos below the hero fall within Chrome's lazy-load distance, so they load immediately | 23.4 KB |
| After scrolling the whole page | 9 | 20.1 KB mobile / 23.4 KB desktop |
| Opening a case study | +1: the icon sprite (6.9 KB Brotli), fetched once | |

The page has no font, CSS, JS, favicon or third-party requests, and nothing render-blocking.

| Lighthouse 13.5 | Performance | Accessibility | Best Practices | SEO | Metrics |
| --- | --- | --- | --- | --- | --- |
| Mobile | 100 | 100 | 100 | 100 | FCP 0.8 s, LCP 0.9 s, TBT 0 ms, CLS 0 |
| Desktop | 100 | 100 | 100 | 100 | FCP 0.2 s, LCP 0.3 s, TBT 0 ms, CLS 0 |

## Project layout

- `src/pages/index.astro`: page shell, global tokens (CSS custom properties) and base styles, and the one inline script (collapse button + icon loader)
- `src/pages/404.astro`: served with a 404 status for unknown paths
- `src/components/`: `Head`, `SiteHeader`, `Hero` (with the duties cards), `Experience`, `CaseStudy` (used for both FansAPI and Awoostria), `Archive`, `SiteFooter`. Each has scoped CSS.
- `src/data/content.ts`: all the copy, the experience list, both case studies, the archive and the stack-icon mapping
- `src/assets/`: the avatar, six employer logos and `stack-icons.svg`
- `public/`: `_headers`, `robots.txt`, `apple-touch-icon.png`
- `integrations/csp-headers.mjs`, `scripts/size.mjs`, `scripts/build-worker.mjs`, `worker/`

### Images

Images go through `astro:assets` `<Picture>`: an AVIF `<source>` with a WebP `<img>` fallback.

- **Fixed-size images:** one 2× file each.
  - header avatar: 72 px
  - Fans Holdings logo: 144 px
  - Awoostria logo: 120 px
  - the other four employer logos: 80 px

  Their `width`/`height` attributes reserve space and CSS sets the display size. Each logo is a single file shared by all its placements, so it downloads once.
- **The hero portrait** uses 400/640/832w with `sizes`. It gets `loading="eager"` and `fetchpriority="high"`; everything below the fold is `loading="lazy"`.
- **Favicon:** an inline SVG data URI, so it costs no request.
- **`apple-touch-icon.png`:** a 180×180 palette PNG, generated from the avatar with:
  `node -e 'require("sharp")("src/assets/avatar.jpeg").resize(180,180).png({palette:true,quality:90,effort:10,compressionLevel:9}).toFile("public/apple-touch-icon.png")'`

### Stack icons

`src/assets/stack-icons.svg` holds 28 icons in brand colours, one `<symbol id="si-<slug>">` each.

- **Sources** (credited in the file header):
  - 24 from [Simple Icons](https://simpleicons.org) 16.34.0 (CC0)
  - AWS and AWS S3 from svg-logos (CC0)
  - PHPStan from vscode-icons (MIT)
  - Pest's official logomark from pestphp.com
- **Mapping:** `stackIcons` in `src/data/content.ts` maps each stack label to its slug. `wideStackIcons` lists the symbols that aren't square; today that's only the AWS wordmark, which gets a 27 px slot.
- **Loading:**
  - Each chip has an `<svg><use href="#si-…">` slot.
  - The sprite is imported with `?url&no-inline`, so it ships as a hashed, immutable `/_astro/` file.
  - The inline script fetches it the first time a case study opens, including through find-in-page, and inlines it at the end of `<body>`.
  - It's hidden as a zero-size box rather than with `display:none`, so gradients still paint.
- **Why not inline:** inlining the sprite in the HTML would cost 6.9 KB Brotli, more than the remaining budget, for icons that stay hidden until a case study is opened.
- **Adding an icon:**
  1. Add a `<symbol id="si-<slug>" viewBox="…">` containing the icon's SVG content.
  2. If it uses gradients, prefix their IDs with the slug.
  3. Map the label in `stackIcons`.

### Astro config

- `output: 'static'`, `compressHTML: true`, `build.inlineStylesheets: 'always'`
- `prefetch: false`, and no `<ClientRouter />`, so no view-transitions runtime
- `scopedStyleStrategy: 'class'`, which produces about 2.4 KB less raw HTML than the default `data-astro-cid-*` attributes

## Differences from the design

The design is the Claude Design project "Redesign C - Bright". These changes were made for speed:

- **Fonts.** The site uses a `system-ui` and `ui-monospace` stack instead of Bricolage Grotesque and Geist Mono from Google Fonts. Self-hosting Latin subsets would cost:
  - Bricolage Grotesque: 40.3 KB as a weight-only variable font, or 75.1 KB with the optical-size axis
  - Geist Mono 400/500: another 22.6 KB

  That's 4–8× the whole HTML. Headings keep the design's weight 800 and tight tracking.
- **Stack icons.** The design loaded them from `cdn.simpleicons.org`, which meant 24 third-party requests. They now come from one self-hosted sprite, loaded on demand. It also adds the icons the design lacked: AWS, S3, Pest and PHPStan.
- **Expand/collapse.** The design used React state; the site uses a native `<details>` element. It works without JS, and Chrome's find-in-page opens it. The inline script handles the bottom "Collapse" button: it closes the section, scrolls back to the top of the case study and returns focus to the toggle.
- **Logos stay raster.** The FansAPI `>_` mark and the Awoostria wolf are simple enough to be inline SVG, but they're kept as raster: 1.9 KB and 2.7 KB AVIF.

Smaller deviations:

- **Contrast.** The faint grey `#7a7684` is darkened to `#6c6876`, so dates and small labels pass WCAG AA.
- **Arrows.** ↗ ↓ ↑ are CSS pseudo-elements with empty alt text, so screen readers skip them. A no-break space keeps each arrow attached to its label.
- **Mobile header.** Below 720 px, the nav moves under the name and the "Get in touch" button.
- **Accessibility.**
  - Stats and duties use `<dl>`.
  - The inline `awoostria.at` link is underlined.
  - There's a skip link and visible `:focus-visible` rings.
  - Smooth scrolling only applies under `prefers-reduced-motion: no-preference`.
