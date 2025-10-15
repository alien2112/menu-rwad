// Ensure global self exists for libraries that expect a browser-like environment during SSR
// This is safe because in Node.js, globalThis refers to the global object
if (typeof globalThis !== 'undefined' && typeof (globalThis as any).self === 'undefined') {
  (globalThis as any).self = globalThis as any;
}


