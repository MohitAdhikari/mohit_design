import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://phoneocean.in';

  return {
    name: 'PHONEOCEAN',
    short_name: 'PHONEOCEAN',
    description: 'Gaming news, esports updates and exclusive interviews.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0B0B0F',
    theme_color: '#00E5FF',
    orientation: 'portrait-primary',
    icons: [
      {
        src: `${baseUrl}/logo_phoneocean.png`,
        sizes: 'any',
        type: 'image/png',
      },
      {
        src: `${baseUrl}/logo.svg`,
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
