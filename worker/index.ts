// Serves the static build straight from the Worker bundle: no asset-storage lookup, and
// HTML/SVG go out pre-compressed at Brotli q11 instead of the edge's on-the-fly level.
import { assets } from '../.worker/manifest';
import type { Asset } from './asset';

const notFound = assets['/404.html'];

export default {
  fetch(request) {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response(null, { status: 405, headers: { allow: 'GET, HEAD' } });
    }
    const { pathname } = new URL(request.url);
    if (pathname.endsWith('/index.html')) {
      return new Response(null, { status: 308, headers: { location: pathname.slice(0, -'index.html'.length) } });
    }
    const asset = assets[pathname];
    return asset ? serve(request, asset, 200) : serve(request, notFound, 404);
  },
} satisfies ExportedHandler;

function serve(request: Request, asset: Asset, status: number): Response {
  const headers = new Headers(asset.headers);
  if (status === 200 && request.headers.get('if-none-match') === asset.headers.etag) {
    return new Response(null, { status: 304, headers });
  }

  // Cloudflare transcodes for the rare client that accepts neither encoding.
  const accept = request.headers.get('accept-encoding') ?? '';
  let body = asset.identity;
  if (asset.br && /\bbr\b/.test(accept)) {
    body = asset.br;
    headers.set('content-encoding', 'br');
  } else if (asset.gzip && /\bgzip\b/.test(accept)) {
    body = asset.gzip;
    headers.set('content-encoding', 'gzip');
  }
  return new Response(request.method === 'HEAD' ? null : body, { status, headers, encodeBody: 'manual' });
}
