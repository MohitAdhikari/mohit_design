import { defineType, defineField } from 'sanity'

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
      name: 'team1',
      title: 'Team 1',
      type: 'reference',
      group: 'core',
      to: [{ type: 'team' }],
    }),
    defineField({
      name: 'team2',
      title: 'Team 2',
      type: 'reference',
      group: 'core',
      to: [{ type: 'team' }],
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
    }),
    defineField({
      name: 'team2Score',
      title: 'Team 2 Score',
      type: 'number',
      group: 'result',
    }),
    defineField({
      name: 'winner',
      title: 'Winner',
      type: 'reference',
      group: 'result',
      to: [{ type: 'team' }],
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
      team1: 'team1.name',
      team2: 'team2.name',
      status: 'status',
      scheduledAt: 'scheduledAt',
    },
    prepare({ team1, team2, status, scheduledAt }) {
      const teams = team1 && team2 ? `${team1} vs ${team2}` : 'Match'
      const date = scheduledAt ? new Date(scheduledAt).toLocaleDateString('en-IN') : ''
      return { title: teams, subtitle: `${status} · ${date}` }
    },
  },
})
