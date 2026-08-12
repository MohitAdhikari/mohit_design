/**
 * Validates a file's real format by inspecting its magic bytes, rather than
 * trusting the client-supplied `Content-Type` header (which any script can
 * spoof to smuggle an arbitrary file past a naive MIME check).
 */
const SIGNATURES: { mime: string; check: (bytes: Uint8Array) => boolean }[] = [
  {
    mime: 'image/jpeg',
    check: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  },
  {
    mime: 'image/png',
    check: (b) =>
      b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 &&
      b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a,
  },
  {
    mime: 'image/gif',
    check: (b) =>
      b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38 &&
      (b[4] === 0x37 || b[4] === 0x39) && b[5] === 0x61,
  },
  {
    mime: 'image/webp',
    check: (b) =>
      b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
      b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50,
  },
];

/**
 * Returns the sniffed MIME type if the buffer matches a known image
 * signature, or null if it doesn't match anything we recognize.
 */
export function sniffImageMimeType(buffer: Buffer): string | null {
  const bytes = new Uint8Array(buffer.subarray(0, 12));
  for (const sig of SIGNATURES) {
    if (sig.check(bytes)) return sig.mime;
  }
  return null;
}
