import type { MetadataRoute } from 'next';

// Next.js automatically serves this file's return value at
// /manifest.webmanifest — no additional route or config needed.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'PHONEOCEAN',
    short_name: 'PHONEOCEAN',
    description:
      "India's trusted gaming and esports news platform covering BGMI, Valorant, PUBG Mobile, Free Fire, esports tournaments, guides and gaming updates.",
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0f172a',
    orientation: 'portrait',
    categories: ['news', 'games', 'esports'],
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}
