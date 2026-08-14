import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import GameCodePage from '@/components/game-codes/GameCodePage';
import type { CodeItem, PollOption } from '@/components/game-codes/GameCodePage';
import { getGuideBySlug } from '@/lib/api';
import { formatDateCompactIST } from '@/utils/formatDate';

// ISR-MODE: static — on-demand only via the Sanity webhook (/api/revalidate)
// or a manual redeploy. Zero time-based ISR writes. Switch back with:
//   node scripts/setIsrMode.mjs normal
export const revalidate = false;

export const metadata: Metadata = {
  title: 'Blox Fruits Codes | PHONEOCEAN',
  description: 'All active Blox Fruits redeem codes in one place. Copy in one tap, check rewards, and learn how to redeem them in-game.',
  openGraph: {
    title: 'Blox Fruits Codes | PHONEOCEAN',
    description: 'All active Blox Fruits redeem codes in one place. Copy in one tap, check rewards, and learn how to redeem them in-game.',
    type: 'website',
    url: '/codes/blox-fruits',
  },
  alternates: {
    canonical: '/codes/blox-fruits',
  },
  robots: {
    index: true,
    follow: true,
  },
};

const POLL_OPTIONS: PollOption[] = [
  { label: 'Apex Legends', percent: 34, barClass: 'bg-gradient-to-r from-[#7c3aed] to-[#a78bfa]' },
  { label: 'Fortnite', percent: 28, barClass: 'bg-gradient-to-r from-[#2563eb] to-[#60a5fa]' },
  { label: 'Valorant', percent: 22, barClass: 'bg-gradient-to-r from-[#dc2626] to-[#f87171]' },
  { label: 'Genshin Impact', percent: 16, barClass: 'bg-gradient-to-r from-[#d97706] to-[#fbbf24]' },
];

const HOW_TO_REDEEM = (
  <ol className="mt-3 pl-5 list-decimal text-[#94a3b8] leading-loose">
    <li>Open <strong className="text-[#f1f5f9]">Blox Fruits</strong> in Roblox</li>
    <li>Click the <strong className="text-[#f1f5f9]">Twitter / bird icon</strong> in the menu</li>
    <li>Copy a code above using the <strong className="text-[#7c3aed]">Copy</strong> button</li>
    <li>Paste into the code field and hit <strong className="text-[#f1f5f9]">Redeem</strong></li>
    <li>Enjoy your rewards 🎉</li>
  </ol>
);

const UPDATE_INSTRUCTIONS = (
  <>
    <p>Edit the <code className="bg-[#1e2130] px-1.5 py-0.5 rounded text-[#a5b4fc] font-mono text-xs">CODES</code> array or the <code className="bg-[#1e2130] px-1.5 py-0.5 rounded text-[#a5b4fc] font-mono text-xs">FALLBACK_CODES</code> in this page file.</p>
    <p className="mt-4"><strong>Status values:</strong></p>
    <ul className="pl-5 list-disc mt-2">
      <li><code className="bg-[#1e2130] px-1.5 py-0.5 rounded text-[#a5b4fc] font-mono text-xs">&quot;active&quot;</code> — Confirmed working</li>
      <li><code className="bg-[#1e2130] px-1.5 py-0.5 rounded text-[#a5b4fc] font-mono text-xs">&quot;notsure&quot;</code> — Unverified</li>
      <li><code className="bg-[#1e2130] px-1.5 py-0.5 rounded text-[#a5b4fc] font-mono text-xs">&quot;expired&quot;</code> — Dead, goes to bottom</li>
    </ul>
    <p className="mt-4">Update <code className="bg-[#1e2130] px-1.5 py-0.5 rounded text-[#a5b4fc] font-mono text-xs">lastChecked</code> and <code className="bg-[#1e2130] px-1.5 py-0.5 rounded text-[#a5b4fc] font-mono text-xs">LAST_UPDATED</code> where applicable, then save and reload. The page auto-sorts itself.</p>
  </>
);

const FALLBACK_CODES: CodeItem[] = [
  { code: 'Sub2Fer999', reward: '2x XP / Money', status: 'active', addedDate: '2026-08-08', lastChecked: '2026-08-08' },
  { code: 'Enyu_is_Pro', reward: 'Blox Fruits reward', status: 'active', addedDate: '2026-08-08', lastChecked: '2026-08-08' },
  { code: 'Magicbus', reward: 'Blox Fruits reward', status: 'active', addedDate: '2026-08-08', lastChecked: '2026-08-08' },
];

function mapGuideToCodeItems(guide: any): CodeItem[] {
  const baseDate = guide.lastUpdated || guide.publishDate || new Date().toISOString();

  const rich: CodeItem[] = (guide.codeEntries || []).map((e: any) => {
    const status: CodeItem['status'] = e.isExpired || e.isRedeemed ? 'expired' : 'active';
    return {
      code: e.code,
      reward: e.reward || 'Blox Fruits reward',
      status,
      addedDate: baseDate,
      lastChecked: baseDate,
    };
  });

  if (rich.length === 0 && (guide.codesList || []).length > 0) {
    return guide.codesList.map((code: string) => ({
      code,
      reward: 'Blox Fruits reward',
      status: 'active' as const,
      addedDate: baseDate,
      lastChecked: baseDate,
    }));
  }

  return rich;
}

export default async function BloxFruitsCodesPage() {
  const guide = await getGuideBySlug('blox-fruits-codes');
  const codes = guide ? mapGuideToCodeItems(guide) : FALLBACK_CODES;
  const lastUpdated = guide?.lastUpdated || guide?.publishDate || '2026-08-08';

  if (codes.length === 0) {
    notFound();
  }

  return (
    <GameCodePage
      title="Blox Fruits"
      lastUpdated={lastUpdated}
      codes={codes}
      howToRedeem={HOW_TO_REDEEM}
      pollQuestion="Favourite Free-to-Play Game?"
      pollOptions={POLL_OPTIONS}
      pollTotalVotes="97,454"
      updateInstructions={UPDATE_INSTRUCTIONS}
      footerNote={`Codes verified manually. Last full check: ${formatDateCompactIST(lastUpdated)}`}
    />
  );
}
