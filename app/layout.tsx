import type {Metadata} from 'next';
import { Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import ClientLayoutShell from '@/components/ClientLayoutShell';
import { getNewsPosts, getSiteSettings } from '@/lib/api';
import { GoogleAnalytics } from '@next/third-parties/google';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const faviconUrl = settings.logoUrl?.trim() ? settings.logoUrl : '/logo_phoneocean.png';
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://phoneocean.in';
  const siteName = settings.siteName || 'PHONEOCEAN';
  const title = 'PHONEOCEAN | Esports, Gaming News & New Launch Reviews';
  const description = "India's #1 esports and gaming news platform. Latest BGMI, PUBG Mobile, Valorant tournament results, rosters and exclusive interviews.";
  const ogImage = `${baseUrl}/logo_phoneocean.png`;

  return {
    metadataBase: new URL(baseUrl),
    title,
    description,
    icons: {
      icon: faviconUrl,
      apple: settings.logoUrl?.trim() ? settings.logoUrl : '/apple-touch-icon.png',
    },
    alternates: {
      canonical: '/',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-snippet': -1,
        'max-image-preview': 'large',
        'max-video-preview': -1,
      },
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: '/',
      siteName,
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: siteName }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION && {
      verification: {
        google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
      },
    }),
  };
}

export default async function RootLayout({children}: {children: React.ReactNode}) {
  const [news, settings] = await Promise.all([getNewsPosts(), getSiteSettings()]);
  const tickerItems = news.slice(0, 6).map((n: any) => ({
    title: n.title,
    href: `/news/${n.slug.current}`,
    showOnHomepage: n.showOnHomepage,
  }));

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://phoneocean.in';
  const siteName = settings.siteName || 'PHONEOCEAN';
  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteName,
    url: baseUrl,
    logo: {
      '@type': 'ImageObject',
      url: settings.logoUrl || `${baseUrl}/logo_phoneocean.png`,
      width: 600,
      height: 60,
    },
  };
  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  const themeInitScript = `
    (function(){
      try {
        var theme = localStorage.getItem('theme') || 'dark';
        if (theme === 'system') {
          theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
          document.documentElement.style.colorScheme = 'dark';
          document.documentElement.style.backgroundColor = '#0B0B0F';
        } else {
          document.documentElement.classList.remove('dark');
          document.documentElement.style.colorScheme = 'light';
          document.documentElement.style.backgroundColor = '#ffffff';
        }
      } catch (e) {}
    })();
  `;

  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <head>
        <link rel="alternate" type="application/rss+xml" title="PHONEOCEAN" href="/feed.xml" />
        <link rel="preconnect" href="https://cdn.sanity.io" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://cdn.sanity.io" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="bg-white dark:bg-[#0B0B0F] text-gray-900 dark:text-white font-sans antialiased min-h-screen flex flex-col" suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={true}>
          <ClientLayoutShell
            tickerItems={tickerItems}
            settings={settings}
            logoUrl={settings.logoUrl}
            siteName={settings.siteName}
            logoTextSpacing={settings.logoTextSpacing}
            logoOnTop={settings.logoOnTop}
          >
            {children}
          </ClientLayoutShell>
        </ThemeProvider>
      </body>
      {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
      )}
    </html>
  );
}
