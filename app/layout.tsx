import type {Metadata} from 'next';
import { Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ThemeProvider } from '@/components/ThemeProvider';
import BreakingTicker from '@/components/BreakingTicker';
import NewsletterCTA from '@/components/NewsletterCTA';
import AmbientBackground from '@/components/AmbientBackground';
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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://phoneocean.in'),
  title: 'PHONEOCEAN | Gaming News, Esports Updates & Exclusive Interviews',
  description: 'Professional esports news and content platform featuring latest BGMI updates, roster changes, and Roblox codes.',
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION && {
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    },
  }),
};

export default async function RootLayout({children}: {children: React.ReactNode}) {
  const [news, settings] = await Promise.all([getNewsPosts(), getSiteSettings()]);
  const tickerItems = news.slice(0, 6).map((n: any) => ({
    title: n.title,
    href: `/news/${n.slug.current}`,
  }));

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://phoneocean.in';
  const siteName = settings.siteName || 'PHONEOCEAN';
  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteName,
    url: baseUrl,
    logo: settings.logoUrl || `${baseUrl}/logo.svg`,
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

  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
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
          <AmbientBackground />
          <Navbar logoUrl={settings.logoUrl} siteName={settings.siteName} />
          <div className="pt-20">
            <BreakingTicker items={tickerItems} />
          </div>
          <main className="flex-grow">
            {children}
          </main>
          <NewsletterCTA />
          <Footer settings={settings} />
        </ThemeProvider>
      </body>
      {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
      )}
    </html>
  );
}
