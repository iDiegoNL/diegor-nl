// Wrangler bundles .bin imports as Data modules, which arrive as ArrayBuffers.
declare module '*.bin' {
  const data: ArrayBuffer;
  export default data;
}
