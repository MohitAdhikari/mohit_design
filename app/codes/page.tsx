import { Metadata } from 'next';
import { getGameCodes } from '@/lib/api';
import GameCodesClient from '@/components/GameCodesClient';

// ZERO-ISR MODE: rendered per request, never written to the ISR cache.
// This makes Vercel "ISR Write Units" structurally impossible to consume,
// and means content published in Sanity appears immediately without any
// redeploy. Cost shifts to Function Invocations (a far larger budget).
// Do NOT reintroduce `revalidate`, `generateStaticParams` or
// `dynamicParams` on these routes without understanding the ISR billing.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Game Redeem Codes | PHONEOCEAN',
  description: 'All active game redeem codes in one place. Copy working codes for BGMI, Free Fire, Roblox and more with instant one-tap copy.',
  openGraph: {
    title: 'Game Redeem Codes | PHONEOCEAN',
    description: 'All active game redeem codes in one place. Copy working codes for BGMI, Free Fire, Roblox and more.',
    type: 'website',
    url: '/codes',
  },
  alternates: {
    canonical: '/codes',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function CodesPage() {
  const guides = await getGameCodes();
  return <GameCodesClient guides={guides} />;
}
