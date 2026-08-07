'use client';
import { usePathname } from 'next/navigation';
import BreakingTicker from './BreakingTicker';
import Navbar from './Navbar';
import Footer from './Footer';
import NewsletterCTA from './NewsletterCTA';
import AmbientBackground from './AmbientBackground';

interface Props {
  tickerItems: { title: string; href: string; showOnHomepage?: boolean }[];
  settings: any;
  children: React.ReactNode;
  logoUrl?: string;
  siteName?: string;
  logoTextSpacing?: number;
  logoOnTop?: boolean;
}

export default function ClientLayoutShell({
  tickerItems, settings, children,
  logoUrl, siteName, logoTextSpacing, logoOnTop,
}: Props) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');

  if (isDashboard) {
    return <>{children}</>;
  }

  const visibleTickerItems = (pathname === '/'
    ? tickerItems.filter((item) => item.showOnHomepage !== false)
    : tickerItems
  ).map(({ title, href }) => ({ title, href }));

  return (
    <>
      <AmbientBackground />
      <Navbar
        logoUrl={logoUrl}
        siteName={siteName}
        logoTextSpacing={logoTextSpacing}
        logoOnTop={logoOnTop}
      />
      <div className="pt-20">
        <BreakingTicker items={visibleTickerItems} />
      </div>
      <main className="flex-grow">{children}</main>
      <NewsletterCTA />
      <Footer settings={settings} />
    </>
  );
}
