import { defineType, defineField } from 'sanity'
import { BulkTeamAddInput } from '../components/BulkTeamAddInput'

export const match = defineType({
  name: 'match',
  title: 'Match',
  type: 'document',
  groups: [
    { name: 'core', title: 'Core', default: true },
    { name: 'result', title: 'Result' },
    { name: 'meta', title: 'Meta' },
  ],
  fields: [
    defineField({
      name: 'tournament',
      title: 'Tournament',
      type: 'reference',
      group: 'core',
      to: [{ type: 'tournament' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'edition',
      title: 'Edition',
      type: 'reference',
      group: 'core',
      to: [{ type: 'tournamentEdition' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'matchFormat',
      title: 'Match Format',
      type: 'string',
      group: 'core',
      initialValue: 'head_to_head',
      description: 'Head to Head is a 2-team match (e.g. Valorant). Battle Royale supports 16+ teams with placement/kill points (e.g. BGMI).',
      options: {
        list: [
          { title: 'Head to Head (2 teams)', value: 'head_to_head' },
          { title: 'Battle Royale (multi-team lobby)', value: 'battle_royale' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'team1',
      title: 'Team 1',
      type: 'reference',
      group: 'core',
      to: [{ type: 'team' }],
      hidden: ({ document }) => document?.matchFormat === 'battle_royale',
    }),
    defineField({
      name: 'team2',
      title: 'Team 2',
      type: 'reference',
      group: 'core',
      to: [{ type: 'team' }],
      hidden: ({ document }) => document?.matchFormat === 'battle_royale',
    }),
    defineField({
      name: 'participants',
      title: 'Participants (Battle Royale lobby)',
      type: 'array',
      group: 'core',
      of: [{ type: 'matchParticipant' }],
      hidden: ({ document }) => document?.matchFormat !== 'battle_royale',
      description: 'Add every team playing in this lobby (typically 16-25 for BGMI). Use "Bulk add teams" above the list to paste many at once.',
      components: { input: BulkTeamAddInput },
      validation: (Rule) =>
        Rule.custom((participants, context) => {
          const doc = context.document as any
          if (doc?.matchFormat !== 'battle_royale') return true
          if (!participants || (participants as unknown[]).length < 2) {
            return 'Add at least 2 teams for a Battle Royale match.'
          }
          return true
        }),
    }),
    defineField({
      name: 'scheduledAt',
      title: 'Scheduled At',
      type: 'datetime',
      group: 'core',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      group: 'core',
      initialValue: 'scheduled',
      options: {
        list: [
          { title: 'Scheduled', value: 'scheduled' },
          { title: 'Live', value: 'live' },
          { title: 'Completed', value: 'completed' },
          { title: 'Cancelled', value: 'cancelled' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'stage',
      title: 'Stage',
      type: 'string',
      group: 'core',
      options: {
        list: [
          { title: 'Group Stage', value: 'group_stage' },
          { title: 'Quarterfinals', value: 'quarterfinals' },
          { title: 'Semifinals', value: 'semifinals' },
          { title: 'Grand Finals', value: 'grand_finals' },
        ],
      },
    }),
    defineField({
      name: 'group',
      title: 'Group',
      type: 'string',
      group: 'core',
      description: 'e.g. Group A, Group B',
    }),
    defineField({
      name: 'matchNumber',
      title: 'Match Number',
      type: 'number',
      group: 'core',
      description: 'Match number within the day or stage.',
    }),
    defineField({
      name: 'map',
      title: 'Map',
      type: 'string',
      group: 'core',
      options: {
        list: [
          { title: 'Erangel', value: 'erangel' },
          { title: 'Miramar', value: 'miramar' },
          { title: 'Sanhok', value: 'sanhok' },
          { title: 'Vikendi', value: 'vikendi' },
          { title: 'Rondo', value: 'rondo' },
          { title: 'Nusa', value: 'nusa' },
        ],
      },
    }),

    // ---- RESULT ----
    defineField({
      name: 'team1Score',
      title: 'Team 1 Score',
      type: 'number',
      group: 'result',
      hidden: ({ document }) => document?.matchFormat === 'battle_royale',
    }),
    defineField({
      name: 'team2Score',
      title: 'Team 2 Score',
      type: 'number',
      group: 'result',
      hidden: ({ document }) => document?.matchFormat === 'battle_royale',
    }),
    defineField({
      name: 'winner',
      title: 'Winner',
      type: 'reference',
      group: 'result',
      to: [{ type: 'team' }],
      description: 'For Battle Royale, this is typically the #1 placed team (chicken dinner).',
    }),

    // ---- META ----
    defineField({
      name: 'broadcastUrl',
      title: 'Broadcast URL',
      type: 'url',
      group: 'meta',
      description: 'YouTube or Twitch stream link.',
    }),
    defineField({
      name: 'recap',
      title: 'Match Recap Article',
      type: 'reference',
      group: 'meta',
      to: [{ type: 'newsPost' }],
    }),
  ],
  preview: {
    select: {
      matchFormat: 'matchFormat',
      team1: 'team1.name',
      team2: 'team2.name',
      participants: 'participants',
      status: 'status',
      scheduledAt: 'scheduledAt',
    },
    prepare({ matchFormat, team1, team2, participants, status, scheduledAt }) {
      const teams =
        matchFormat === 'battle_royale'
          ? `${(participants as unknown[])?.length ?? 0}-team lobby`
          : team1 && team2 ? `${team1} vs ${team2}` : 'Match'
      const date = scheduledAt ? new Date(scheduledAt).toLocaleDateString('en-IN') : ''
      return { title: teams, subtitle: `${status} · ${date}` }
    },
  },
})
