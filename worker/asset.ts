/** One file from dist/, as packed by scripts/build-worker.mjs. */
export interface Asset {
  /** Final response headers (from _headers, plus content-type, etag and vary). */
  headers: Record<string, string>;
  identity: ArrayBuffer;
  /** Pre-compressed variants; only present for text files. */
  br?: ArrayBuffer;
  gzip?: ArrayBuffer;
}
