import { defineType, defineField } from 'sanity'

export const match = defineType({
  name: 'match',
  title: 'Match',
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
      name: 'stage',
      title: 'Stage',
      type: 'string',
      options: {
        list: [
          { title: 'Group Stage', value: 'group_stage' },
          { title: 'Survival Stage', value: 'survival_stage' },
          { title: 'Semifinals', value: 'semifinals' },
          { title: 'Grand Finals', value: 'grand_finals' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'group',
      title: 'Group (if applicable)',
      type: 'string',
      options: {
        list: [
          { title: 'Group A', value: 'Group A' },
          { title: 'Group B', value: 'Group B' },
          { title: 'Group C', value: 'Group C' },
          { title: 'Group D', value: 'Group D' },
        ],
      },
    }),
    defineField({
      name: 'matchNumber',
      title: 'Match Number',
      type: 'number',
      description: 'Match 1, Match 2... in sequence for this edition',
    }),
    defineField({
      name: 'team1',
      title: 'Team 1',
      type: 'reference',
      to: [{ type: 'team' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'team2',
      title: 'Team 2',
      type: 'reference',
      to: [{ type: 'team' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'team1Score',
      title: 'Team 1 Score / Points',
      type: 'number',
      initialValue: 0,
    }),
    defineField({
      name: 'team2Score',
      title: 'Team 2 Score / Points',
      type: 'number',
      initialValue: 0,
    }),
    defineField({
      name: 'status',
      title: 'Match Status',
      type: 'string',
      options: {
        list: [
          { title: '🕐 Scheduled', value: 'scheduled' },
          { title: '🔴 Live', value: 'live' },
          { title: '✅ Completed', value: 'completed' },
          { title: '❌ Cancelled', value: 'cancelled' },
        ],
        layout: 'radio',
      },
      initialValue: 'scheduled',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'winner',
      title: 'Winner',
      type: 'reference',
      to: [{ type: 'team' }],
      description: 'Set after match completes',
    }),
    defineField({
      name: 'scheduledAt',
      title: 'Scheduled Date & Time',
      type: 'datetime',
      options: { dateFormat: 'YYYY-MM-DD', timeFormat: 'HH:mm' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'map',
      title: 'Map / Zone',
      type: 'string',
      options: {
        list: [
          { title: 'Erangel', value: 'erangel' },
          { title: 'Miramar', value: 'miramar' },
          { title: 'Sanhok', value: 'sanhok' },
          { title: 'Vikendi', value: 'vikendi' },
          { title: 'Livik', value: 'livik' },
          { title: 'Multiple Maps', value: 'multiple' },
        ],
      },
    }),
    defineField({
      name: 'broadcastUrl',
      title: 'Broadcast / Stream URL',
      type: 'url',
    }),
    defineField({
      name: 'playerOfMatch',
      title: 'Player of the Match',
      type: 'reference',
      to: [{ type: 'player' }],
    }),
    defineField({
      name: 'highlightStat',
      title: 'Highlight Stat',
      type: 'string',
      description: 'e.g. "Jonathan — 14 kills, 1,200 damage"',
    }),
    defineField({
      name: 'notes',
      title: 'Admin Notes',
      type: 'text',
      rows: 2,
      description: 'Internal notes — not shown on site',
    }),
  ],
  preview: {
    select: {
      team1: 'team1.name',
      team2: 'team2.name',
      status: 'status',
      stage: 'stage',
      t1score: 'team1Score',
      t2score: 'team2Score',
    },
    prepare({ team1, team2, status, stage, t1score, t2score }) {
      const statusIcon = status === 'live' ? '🔴' : status === 'completed' ? '✅' : '🕐'
      return {
        title: `${team1 ?? 'TBD'} vs ${team2 ?? 'TBD'}`,
        subtitle: `${statusIcon} ${status?.toUpperCase()} · ${t1score ?? 0} – ${t2score ?? 0} · ${stage ?? ''}`,
      }
    },
  },
  orderings: [
    {
      title: 'Scheduled Date (newest)',
      name: 'scheduledAtDesc',
      by: [{ field: 'scheduledAt', direction: 'desc' }],
    },
  ],
})
