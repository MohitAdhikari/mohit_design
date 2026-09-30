import { defineField, defineType } from 'sanity'
import { StandingRowsPasteInput } from '../components/BulkPasteArrayInput'
import { STANDING_STAGE_OPTIONS } from '../../lib/articleImport/tournamentMeta'

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
      options: { list: STANDING_STAGE_OPTIONS },
    }),
    defineField({
      name: 'week',
      title: 'Week',
      type: 'number',
      description: 'e.g. 2 for "League Stage Week 2". Leave empty for stages without weeks.',
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
      name: 'matchesPlayed',
      title: 'Matches Played (this day)',
      type: 'number',
      description: 'How many matches this table covers, e.g. 3 for a 3-match day.',
    }),
    defineField({
      name: 'teamsCount',
      title: 'Teams in Group',
      type: 'number',
      description: 'Number of teams in this group/lobby, e.g. 16.',
    }),
    defineField({
      name: 'sourceArticle',
      title: 'Imported From Article',
      type: 'reference',
      to: [{ type: 'newsPost' }],
      description: 'Set automatically when imported from an article.',
      readOnly: true,
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
          { title: 'Snapshot', value: 'snapshot' },
          { title: 'Live', value: 'live' },
          { title: 'Final', value: 'final' },
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
      components: { input: StandingRowsPasteInput },
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
              name: 'prize',
              title: 'Prize Money',
              type: 'string',
              description: 'Placement prize awarded to this team, when available.',
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
