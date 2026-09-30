import { tournamentAccent, initials } from '../../lib/tournamentColors'

/** Coloured initials tile used as list-preview media when a tournament has no logo. */
export function TournamentSwatch({ name, color }: { name?: string | null; color?: string | null }) {
  const bg = tournamentAccent(name, color)
  return (
    <span
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        background: bg,
        color: '#0B0B0F',
        fontWeight: 800,
        fontSize: 11,
        letterSpacing: 0.5,
        borderRadius: 3,
      }}
    >
      {initials(name)}
    </span>
  )
}
