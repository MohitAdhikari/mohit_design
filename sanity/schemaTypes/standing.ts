import { defineField, defineType } from 'sanity'

export const standing = defineType({
  name: 'standing',
  title: 'Standing Table',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Table Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'tournament',
      title: 'Tournament',
      type: 'reference',
      to: [{ type: 'tournament' }],
      validation: (Rule) => Rule.required(),
    }),
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
          { title: 'Grand Finals', value: 'grand_finals' },
          { title: 'League Stage', value: 'league_stage' },
          { title: 'Finals', value: 'finals' },
          { title: 'Overall', value: 'overall' },
        ],
      },
    }),
    defineField({
      name: 'group',
      title: 'Group',
      type: 'string',
      description: 'Example: Group A, Group B, Overall',
    }),
    defineField({
      name: 'day',
      title: 'Day',
      type: 'number',
    }),
    defineField({
      name: 'afterMatch',
      title: 'After Match',
      type: 'number',
      description: 'Example: standings after match 6',
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      initialValue: 'published',
      options: {
        list: [
          { title: 'Draft', value: 'draft' },
          { title: 'Published', value: 'published' },
          { title: 'Archived', value: 'archived' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'lastUpdated',
      title: 'Last Updated',
      type: 'datetime',
    }),
    defineField({
      name: 'mobileCardStyle',
      title: 'Mobile Card Style',
      type: 'string',
      description: '"Modern" adds colored rank badges, a top-3 accent stripe, and a prominent points display. "Classic" keeps the older plain chip layout.',
      options: {
        list: [
          { title: 'Modern (rank badge + accent) — recommended', value: 'modern' },
          { title: 'Classic (simple flat chips)', value: 'classic' },
        ],
        layout: 'radio',
      },
      initialValue: 'modern',
    }),
    defineField({
      name: 'mobileHiddenStats',
      title: 'Hide Stats on Mobile',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Matches Played (MP)', value: 'matchesPlayed' },
          { title: 'WWCD', value: 'wwcd' },
          { title: 'Placement Points', value: 'placementPoints' },
          { title: 'Kills', value: 'kills' },
        ],
      },
      description: 'Choose which stat chips to hide from the mobile card only — full data always stays visible on desktop.',
    }),
    defineField({
      name: 'rows',
      title: 'Rows',
      type: 'array',
      validation: (Rule) => Rule.required().min(1),
      of: [
        {
          type: 'object',
          name: 'standingRow',
          title: 'Standing Row',
          fields: [
            defineField({
              name: 'rank',
              title: 'Rank',
              type: 'number',
              validation: (Rule) => Rule.required().min(1),
            }),
            defineField({
              name: 'team',
              title: 'Team Reference',
              type: 'reference',
              to: [{ type: 'team' }],
            }),
            defineField({
              name: 'teamName',
              title: 'Team Name Fallback',
              type: 'string',
              description: 'Used when team reference is missing.',
            }),
            defineField({
              name: 'matchesPlayed',
              title: 'Matches Played',
              type: 'number',
              initialValue: 0,
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
              name: 'wwcd',
              title: 'WWCD',
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
              name: 'kills',
              title: 'Kills',
              type: 'number',
              initialValue: 0,
            }),
            defineField({
              name: 'points',
              title: 'Total Points',
              type: 'number',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'change',
              title: 'Rank Change',
              type: 'number',
              description: 'Positive/negative rank movement if available.',
            }),
            defineField({
              name: 'qualified',
              title: 'Qualified',
              type: 'boolean',
              initialValue: false,
            }),
            defineField({
              name: 'eliminated',
              title: 'Eliminated',
              type: 'boolean',
              initialValue: false,
            }),
            defineField({
              name: 'notes',
              title: 'Notes',
              type: 'string',
            }),
          ],
          preview: {
            select: {
              rank: 'rank',
              teamName: 'teamName',
              team: 'team.name',
              points: 'points',
            },
            prepare({ rank, teamName, team, points }) {
              return {
                title: `${rank ?? '-'} — ${team || teamName || 'Team'}`,
                subtitle: `${points ?? 0} pts`,
              }
            },
          },
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      edition: 'edition.year',
      tournament: 'tournament.name',
      status: 'status',
    },
    prepare({ title, edition, tournament, status }) {
      return {
        title,
        subtitle: `${tournament || 'Tournament'} ${edition ? `• ${edition}` : ''} • ${status || 'draft'}`,
      }
    },
  },
})
