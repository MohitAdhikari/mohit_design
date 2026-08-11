import { defineType, defineField } from 'sanity'

export const matchParticipant = defineType({
  name: 'matchParticipant',
  title: 'Participant',
  type: 'object',
  fields: [
    defineField({
      name: 'team',
      title: 'Team',
      type: 'reference',
      to: [{ type: 'team' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'placement',
      title: 'Placement',
      type: 'number',
      description: 'Final rank in this match, e.g. 1 for chicken dinner.',
    }),
    defineField({
      name: 'kills',
      title: 'Kills',
      type: 'number',
      initialValue: 0,
    }),
    defineField({
      name: 'placementPoints',
      title: 'Placement Points',
      type: 'number',
      initialValue: 0,
    }),
    defineField({
      name: 'points',
      title: 'Total Points',
      type: 'number',
      description: 'Placement points + kill points for this match.',
      initialValue: 0,
    }),
    defineField({
      name: 'roster',
      title: 'Roster (this match)',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'player' }] }],
      description: 'Optional. Only needed if different from the team\'s default 4-6 player roster (e.g. a substitute played this match).',
      validation: (Rule) => Rule.max(6).warning('BGMI squads are typically 4-6 players.'),
    }),
  ],
  preview: {
    select: { team: 'team.name', placement: 'placement', kills: 'kills' },
    prepare({ team, placement, kills }) {
      const rank = placement ? `#${placement}` : 'Unplaced'
      return {
        title: team || 'Team',
        subtitle: `${rank} · ${kills ?? 0} kills`,
      }
    },
  },
})
