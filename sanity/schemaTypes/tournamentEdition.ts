import { type ReactNode } from 'react'
import { defineType, defineField } from 'sanity'

export const tournamentEdition = defineType({
  name: 'tournamentEdition',
  title: 'Tournament Edition',
  type: 'document',
  fields: [
    // ── Core ──────────────────────────────────────────────────
    defineField({
      name: 'tournament',
      title: 'Tournament (Series)',
      type: 'reference',
      to: [{ type: 'tournament' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'year',
      title: 'Year / Season',
      type: 'string',
      description: 'e.g. 2026, Season 5',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: (doc: Record<string, unknown>) =>
          typeof doc.year === 'string' ? doc.year : '',
        maxLength: 96,
      },
    }),

    // ── Lifecycle status (shown on website) ───────────────────
    defineField({
      name: 'tournamentStatus',
      title: 'Tournament Status',
      type: 'string',
      description: 'Current phase shown on the website. Update manually as the event progresses.',
      options: {
        list: [
          { title: '🔵 Upcoming', value: 'upcoming' },
          { title: '🟢 Group Stage', value: 'group_stage' },
          { title: '🟡 Survival Stage', value: 'survival_stage' },
          { title: '🔴 Grand Finals', value: 'grand_finals' },
          { title: '⚫ Completed', value: 'completed' },
        ],
        layout: 'radio',
      },
      initialValue: 'upcoming',
    }),

    // ── Stages ────────────────────────────────────────────────
    defineField({
      name: 'stages',
      title: 'Stages',
      type: 'array',
      description: 'Add each stage of the tournament (Group Stage, Survival Stage, Grand Finals, etc.)',
      of: [
        {
          type: 'object',
          name: 'stage',
          title: 'Stage',
          fields: [
            defineField({ name: 'name', title: 'Stage Name', type: 'string', description: 'e.g. Group Stage, Survival Stage, Grand Finals' }),
            defineField({
              name: 'status',
              title: 'Stage Status',
              type: 'string',
              options: {
                list: [
                  { title: 'Upcoming', value: 'upcoming' },
                  { title: 'Live', value: 'live' },
                  { title: 'Completed', value: 'completed' },
                ],
                layout: 'radio',
              },
              initialValue: 'upcoming',
            }),
            defineField({ name: 'startDate', title: 'Start Date', type: 'datetime' }),
            defineField({ name: 'endDate', title: 'End Date', type: 'datetime' }),
            defineField({ name: 'venue', title: 'Venue', type: 'string' }),
            defineField({ name: 'format', title: 'Format', type: 'string', description: 'e.g. Battle Royale, Round Robin, Single Elimination' }),
            defineField({ name: 'totalTeams', title: 'Teams in this Stage', type: 'number' }),
            defineField({
              name: 'teamsAdvancing',
              title: 'Teams Advancing',
              type: 'number',
              description: 'How many teams move to the next stage',
            }),
            defineField({ name: 'notes', title: 'Notes', type: 'text', rows: 2 }),
          ],
          preview: {
            select: { title: 'name', subtitle: 'status' },
          },
        },
      ],
    }),

    // ── Details ───────────────────────────────────────────────
    defineField({
      name: 'editionBanner',
      title: 'Edition Banner',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({ name: 'startDate', title: 'Start Date (Overall)', type: 'datetime' }),
    defineField({ name: 'endDate', title: 'End Date (Overall)', type: 'datetime' }),
    defineField({ name: 'venue', title: 'Venue / City', type: 'string' }),
    defineField({
      name: 'format',
      title: 'Format',
      type: 'string',
      options: {
        list: ['Online', 'LAN', 'Hybrid'],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'prizePool',
      title: 'Prize Pool',
      type: 'string',
      description: 'e.g. $3,000,000 or ₹1,00,00,000',
    }),
    defineField({
      name: 'prizeBreakdown',
      title: 'Prize Breakdown',
      type: 'array',
      description: '1st place, 2nd place, etc.',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'place', title: 'Place', type: 'string', description: 'e.g. 1st, 2nd, 3rd–4th' }),
            defineField({ name: 'amount', title: 'Amount', type: 'string', description: 'e.g. $1,000,000' }),
          ],
          preview: { select: { title: 'place', subtitle: 'amount' } },
        },
      ],
    }),
    defineField({ name: 'totalTeams', title: 'Total Teams', type: 'number' }),

    // ── External Links ────────────────────────────────────────
    defineField({ name: 'liquipediaUrl', title: 'Liquipedia URL', type: 'url' }),
    defineField({ name: 'officialUrl', title: 'Official Website', type: 'url' }),
    defineField({ name: 'twitterUrl', title: 'Twitter / X URL', type: 'url' }),

    // ── Teams & Results ───────────────────────────────────────
    defineField({
      name: 'teams',
      title: 'Participating Teams',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'team' }] }],
    }),
    defineField({
      name: 'winner',
      title: 'Winner',
      type: 'reference',
      to: [{ type: 'team' }],
    }),
    defineField({
      name: 'runnerUp',
      title: 'Runner Up',
      type: 'reference',
      to: [{ type: 'team' }],
    }),
    defineField({
      name: 'mvp',
      title: 'MVP',
      type: 'reference',
      to: [{ type: 'player' }],
    }),

    // ── Broadcast ─────────────────────────────────────────────
    defineField({
      name: 'broadcastLinks',
      title: 'Broadcast Links',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'platform', title: 'Platform', type: 'string', description: 'e.g. YouTube, Loco, Twitch' }),
            defineField({ name: 'url', title: 'URL', type: 'url' }),
          ],
        },
      ],
    }),

    // ── Publish ───────────────────────────────────────────────
    defineField({
      name: 'publishStatus',
      title: 'Publish Status',
      type: 'string',
      options: {
        list: ['draft', 'review', 'published'],
        layout: 'radio',
      },
      initialValue: 'draft',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
    }),
  ],
  preview: {
    select: {
      tournamentName: 'tournament.name',
      year: 'year',
      status: 'tournamentStatus',
      media: 'tournament.logo',
    },
    prepare({ tournamentName, year, status, media }) {
      const name = typeof tournamentName === 'string' ? tournamentName : ''
      const yearValue = typeof year === 'string' ? year : ''
      const statusLabel: Record<string, string> = {
        upcoming: '🔵',
        group_stage: '🟢',
        survival_stage: '🟡',
        grand_finals: '🔴',
        completed: '⚫',
      }
      const icon = typeof status === 'string' ? (statusLabel[status] ?? '') : ''
      return {
        title: `${icon} ${name} — ${yearValue}`.trim() || 'Untitled Edition',
        media: media as ReactNode,
      }
    },
  },
})
