import { createImageUrlBuilder, type SanityImageSource } from '@sanity/image-url';
import { client } from './sanityClient';

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

/**
 * Resolve a URL for a portable-text image block without a placeholder fallback.
 * Prefers an already-expanded asset URL and falls back to building one from the
 * Sanity image reference. Returns null if the image cannot be resolved.
 */
export function contentImageUrl(value: any, width = 1200): string | null {
  if (!value) return null;
  const rawUrl = value.assetUrl || value.asset?.url || value.url;
  if (rawUrl) return rawUrl;
  if (value.asset) {
    try {
      return urlFor(value).width(width).auto('format').fit('max').url();
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Resolve a hotspot-aware, fixed-aspect-ratio image URL for hero banners.
 * Unlike `optimizedImageUrl` (which only resizes width), this locks both
 * width AND height and crops around the editor-selected focal point/hotspot
 * in Sanity, so the subject of the photo is never cut off on tall or wide
 * source images.
 */
export function heroImageUrl(
  source: SanityImageSource | string | null | undefined,
  width: number,
  height: number,
  fallback: string = FALLBACK_IMAGE
): string {
  if (!source) return fallback;
  if (typeof source === 'string' && !source.includes('cdn.sanity.io')) {
    return source;
  }
  try {
    return urlFor(source)
      .width(width)
      .height(height)
      .fit('crop')
      .crop('focalpoint')
      .auto('format')
      .url();
  } catch {
    return typeof source === 'string' ? source : fallback;
  }
}
