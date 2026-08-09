import { defineType, defineField } from 'sanity'

export const standing = defineType({
  name: 'standing',
  title: 'Standing',
  type: 'document',
  fields: [
    defineField({
      name: 'edition',
      title: 'Tournament Edition',
      type: 'reference',
      to: [{ type: 'tournamentEdition' }],
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
      options: {
        list: [
          { title: 'Group A', value: 'Group A' },
          { title: 'Group B', value: 'Group B' },
          { title: 'Group C', value: 'Group C' },
          { title: 'Group D', value: 'Group D' },
          { title: 'Overall', value: 'Overall' },
        ],
      },
      initialValue: 'Overall',
    }),
    defineField({ name: 'rank', title: 'Rank', type: 'number', validation: (Rule) => Rule.required().min(1) }),
    defineField({ name: 'matchesPlayed', title: 'Matches Played', type: 'number', initialValue: 0 }),
    defineField({ name: 'wins', title: 'Wins (Chicken Dinners)', type: 'number', initialValue: 0 }),
    defineField({ name: 'losses', title: 'Losses', type: 'number', initialValue: 0 }),
    defineField({ name: 'points', title: 'Total Points', type: 'number', initialValue: 0, validation: (Rule) => Rule.required() }),
    defineField({ name: 'kills', title: 'Total Kills', type: 'number', initialValue: 0 }),
    defineField({ name: 'placementPoints', title: 'Placement Points', type: 'number', initialValue: 0 }),
    defineField({ name: 'killPoints', title: 'Kill Points', type: 'number', initialValue: 0 }),
    defineField({ name: 'isEliminated', title: 'Eliminated?', type: 'boolean', initialValue: false }),
    defineField({ name: 'isAdvanced', title: 'Advanced to next stage?', type: 'boolean', initialValue: false }),
    defineField({ name: 'lastUpdated', title: 'Last Updated', type: 'datetime' }),
  ],
  preview: {
    select: { team: 'team.name', rank: 'rank', points: 'points', kills: 'kills', group: 'group' },
    prepare({ team, rank, points, kills, group }) {
      return {
        title: `#${rank ?? '?'} — ${team ?? 'Unknown Team'}`,
        subtitle: `${group ?? 'Overall'} · ${points ?? 0} pts · ${kills ?? 0} kills`,
      }
    },
  },
  orderings: [
    { title: 'Rank (1st first)', name: 'rankAsc', by: [{ field: 'rank', direction: 'asc' }] },
  ],
})
