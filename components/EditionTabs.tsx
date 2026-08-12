import Link from 'next/link'

export function EditionTabs({
  slug,
  active,
}: {
  slug: string
  active: 'overview' | 'matches' | 'standings'
}) {
  const tabs = [
    { label: 'Overview', href: `/esports/${slug}`, key: 'overview' as const },
    { label: 'Matches', href: `/esports/${slug}/matches`, key: 'matches' as const },
    { label: 'Standings', href: `/esports/${slug}/standings`, key: 'standings' as const },
  ]

  return (
    <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800/60 mb-8">
      {tabs.map((t) => (
        <Link
          key={t.key}
          href={t.href}
          className={`relative px-4 py-2.5 text-xs font-mono uppercase tracking-widest transition-colors ${
            active === t.key
              ? 'text-blue-600 dark:text-[#00E5FF]'
              : 'text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
          }`}
        >
          {t.label}
          {active === t.key && (
            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-600 dark:bg-[#00E5FF] shadow-[0_0_8px_rgba(0,229,255,0.8)]" />
          )}
        </Link>
      ))}
    </div>
  )
}
