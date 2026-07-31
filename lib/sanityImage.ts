import { createImageUrlBuilder, type SanityImageSource } from '@sanity/image-url';
import { client } from './api';

const builder = createImageUrlBuilder(client);

/**
 * Sanity Image URL builder. Accepts a full portable-text image object
 * (respects hotspot/crop), an asset reference, an asset id, or an existing
 * Sanity CDN URL string.
 */
export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

/**
 * Convenience wrapper for resizing/optimizing an already-resolved thumbnail
 * URL (e.g. values returned from GROQ via `asset->url`) or a raw portable
 * text image object. Automatically serves WebP/AVIF via `auto('format')`.
 * Non-Sanity URLs (e.g. picsum.photos placeholders) are returned untouched.
 */
const FALLBACK_IMAGE = 'https://picsum.photos/1200/630';

export function optimizedImageUrl(
  source: SanityImageSource | string | null | undefined,
  width: number,
  fallback: string = FALLBACK_IMAGE
): string {
  if (!source) return fallback;
  if (typeof source === 'string' && !source.includes('cdn.sanity.io')) {
    return source;
  }
  try {
    return urlFor(source).width(width).auto('format').fit('max').url();
  } catch {
    return typeof source === 'string' ? source : fallback;
  }
}
