import { defineType, defineField } from 'sanity'

export const standing = defineType({
  name: 'standing',
  title: 'Standing',
  type: 'document',
  fields: [
    defineField({
      name: 'edition',
      title: 'Edition',
      type: 'reference',
      to: [{ type: 'edition' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'team',
      title: 'Team',
      type: 'reference',
      to: [{ type: 'team' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'group',
      title: 'Group',
      type: 'string',
      description: 'e.g. Group A. Leave blank for overall standings.',
    }),
    defineField({
      name: 'rank',
      title: 'Rank',
      type: 'number',
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'wins',
      title: 'Wins',
      type: 'number',
      initialValue: 0,
    }),
    defineField({
      name: 'losses',
      title: 'Losses',
      type: 'number',
      initialValue: 0,
    }),
    defineField({
      name: 'points',
      title: 'Points',
      type: 'number',
      initialValue: 0,
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: 'kills',
      title: 'Total Kills',
      type: 'number',
      initialValue: 0,
      description: 'BGMI-specific: total elimination points.',
    }),
    defineField({
      name: 'placementPoints',
      title: 'Placement Points',
      type: 'number',
      initialValue: 0,
    }),
    defineField({
      name: 'matchesPlayed',
      title: 'Matches Played',
      type: 'number',
      initialValue: 0,
    }),
    defineField({
      name: 'wwcd',
      title: 'WWCD (Chicken Dinners)',
      type: 'number',
      initialValue: 0,
    }),
    defineField({
      name: 'lastUpdated',
      title: 'Last Updated',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: {
      team: 'team.name',
      rank: 'rank',
      points: 'points',
      edition: 'edition.title',
    },
    prepare({ team, rank, points, edition }) {
      return {
        title: `#${rank} ${team}`,
        subtitle: `${points} pts · ${edition}`,
      }
    },
  },
})
