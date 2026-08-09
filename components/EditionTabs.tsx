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
    <div className="flex gap-1 border-b border-zinc-800 mb-8">
      {tabs.map((t) => (
        <Link
          key={t.key}
          href={t.href}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            active === t.key
              ? 'text-white border-b-2 border-white'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          {t.label}
        </Link>
      ))}
    </div>
  )
}
