import type {Metadata} from 'next';
import { Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ThemeProvider } from '@/components/ThemeProvider';
import BreakingTicker from '@/components/BreakingTicker';
import NewsletterCTA from '@/components/NewsletterCTA';
import { getNewsPosts } from '@/lib/api';
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

export const metadata: Metadata = {
  title: 'PHONEOCEAN | Gaming News, Esports Updates & Exclusive Interviews',
  description: 'Professional esports news and content platform featuring latest BGMI updates, roster changes, and Roblox codes.',
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION && {
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    },
  }),
};

export default async function RootLayout({children}: {children: React.ReactNode}) {
  const news = await getNewsPosts();
  const tickerItems = news.slice(0, 6).map((n: any) => ({
    title: n.title,
    href: `/news/${n.slug.current}`,
  }));

  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body className="bg-white dark:bg-[#0B0B0F] text-gray-900 dark:text-white font-sans antialiased min-h-screen flex flex-col" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={true}>
          <Navbar />
          <div className="pt-20">
            <BreakingTicker items={tickerItems} />
          </div>
          <main className="flex-grow">
            {children}
          </main>
          <NewsletterCTA />
          <Footer />
        </ThemeProvider>
      </body>
      {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
      )}
    </html>
  );
}
