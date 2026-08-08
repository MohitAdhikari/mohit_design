import type { Metadata } from 'next';
import GameCodePage from '@/components/game-codes/GameCodePage';
import type { CodeItem, PollOption } from '@/components/game-codes/GameCodePage';
import { formatDateCompactIST } from '@/utils/formatDate';

export const metadata: Metadata = {
  title: 'Sailor Piece Codes | PHONEOCEAN',
  description: 'All active Sailor Piece redeem codes in one place. Copy in one tap, check rewards, and learn how to redeem them in-game.',
  openGraph: {
    title: 'Sailor Piece Codes | PHONEOCEAN',
    description: 'All active Sailor Piece redeem codes in one place. Copy in one tap, check rewards, and learn how to redeem them in-game.',
    type: 'website',
    url: '/codes/sailor-piece',
  },
  alternates: {
    canonical: '/codes/sailor-piece',
  },
  robots: {
    index: true,
    follow: true,
  },
};

const CODES: CodeItem[] = [
  {
    code: 'SORRYFORBROLYBUGANDWAIT',
    reward: '12,500 XP',
    status: 'expired',
    addedDate: '2026-08-01',
    lastChecked: '2026-08-08',
  },
  {
    code: 'SORRYFORBUGS',
    reward: '12,500 XP',
    status: 'active',
    addedDate: '2026-08-03',
    lastChecked: '2026-08-08',
  },
  {
    code: 'BROLYUPDATE',
    reward: '12,500 XP',
    status: 'active',
    addedDate: '2026-08-04',
    lastChecked: '2026-08-08',
  },
  {
    code: 'SORRYFORANTICHEAT',
    reward: '12,500 XP',
    status: 'notsure',
    addedDate: '2026-07-28',
    lastChecked: '2026-08-06',
  },
  {
    code: 'SORRYFORTHEBANS',
    reward: '12,500 XP',
    status: 'active',
    addedDate: '2026-08-05',
    lastChecked: '2026-08-08',
  },
];

const HOW_TO_REDEEM = (
  <ol className="mt-3 pl-5 list-decimal text-[#94a3b8] leading-loose">
    <li>Open <strong className="text-[#f1f5f9]">Sailor Piece</strong> in Roblox</li>
    <li>Click the <strong className="text-[#f1f5f9]">Twitter / Codes</strong> button in the menu</li>
    <li>Copy a code above using the <strong className="text-[#7c3aed]">Copy</strong> button</li>
    <li>Paste into the code field and hit <strong className="text-[#f1f5f9]">Redeem</strong></li>
    <li>Enjoy your rewards 🎉</li>
  </ol>
);

const UPDATE_INSTRUCTIONS = (
  <>
    <p>Edit the <code className="bg-[#1e2130] px-1.5 py-0.5 rounded text-[#a5b4fc] font-mono text-xs">CODES</code> array in the page file. That is the <strong className="text-[#f1f5f9]">only place</strong> you ever need to change.</p>
    <p className="mt-4"><strong>Status values:</strong></p>
    <ul className="pl-5 list-disc mt-2">
      <li><code className="bg-[#1e2130] px-1.5 py-0.5 rounded text-[#a5b4fc] font-mono text-xs">&quot;active&quot;</code> — Confirmed working</li>
      <li><code className="bg-[#1e2130] px-1.5 py-0.5 rounded text-[#a5b4fc] font-mono text-xs">&quot;notsure&quot;</code> — Unverified</li>
      <li><code className="bg-[#1e2130] px-1.5 py-0.5 rounded text-[#a5b4fc] font-mono text-xs">&quot;expired&quot;</code> — Dead, goes to bottom</li>
    </ul>
    <p className="mt-4">Change <code className="bg-[#1e2130] px-1.5 py-0.5 rounded text-[#a5b4fc] font-mono text-xs">status</code> → update <code className="bg-[#1e2130] px-1.5 py-0.5 rounded text-[#a5b4fc] font-mono text-xs">lastChecked</code> → update <code className="bg-[#1e2130] px-1.5 py-0.5 rounded text-[#a5b4fc] font-mono text-xs">LAST_UPDATED</code> → save → reload. Auto-sorts itself.</p>
  </>
);

const POLL_OPTIONS: PollOption[] = [
  { label: 'Apex Legends', percent: 34, barClass: 'bg-gradient-to-r from-[#7c3aed] to-[#a78bfa]' },
  { label: 'Fortnite', percent: 28, barClass: 'bg-gradient-to-r from-[#2563eb] to-[#60a5fa]' },
  { label: 'Valorant', percent: 22, barClass: 'bg-gradient-to-r from-[#dc2626] to-[#f87171]' },
  { label: 'Genshin Impact', percent: 16, barClass: 'bg-gradient-to-r from-[#d97706] to-[#fbbf24]' },
];

const LAST_UPDATED = '2026-08-08';

export default function SailorPieceCodesPage() {
  return (
    <GameCodePage
      title="Sailor Piece"
      lastUpdated={LAST_UPDATED}
      codes={CODES}
      howToRedeem={HOW_TO_REDEEM}
      pollQuestion="Favourite Free-to-Play Game?"
      pollOptions={POLL_OPTIONS}
      pollTotalVotes="97,454"
      updateInstructions={UPDATE_INSTRUCTIONS}
      footerNote={`Codes verified manually. Last full check: ${formatDateCompactIST(LAST_UPDATED)}`}
    />
  );
}
