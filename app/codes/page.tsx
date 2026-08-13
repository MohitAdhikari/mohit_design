import { Metadata } from 'next';
import { getGameCodes } from '@/lib/api';
import GameCodesClient from '@/components/GameCodesClient';

export const revalidate = 86400;

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
