import { type ReactNode } from 'react'
import { defineType, defineField } from 'sanity'

export const tournamentEdition = defineType({
  name: 'tournamentEdition',
  title: 'Tournament Edition',
  type: 'document',

  groups: [
    { name: 'prizePool', title: 'Prize Pool' },
  ],

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

    // ── Lifecycle status ──────────────────────────────────────
    defineField({
      name: 'tournamentStatus',
      title: 'Tournament Status',
      type: 'string',
      description: 'Current phase shown on the website. Update manually as the event progresses.',
      options: {
        list: [
          { title: '🔵 Upcoming',      value: 'upcoming' },
          { title: '🟢 Group Stage',   value: 'group_stage' },
          { title: '🟡 Survival Stage', value: 'survival_stage' },
          { title: '🔴 Grand Finals',  value: 'grand_finals' },
          { title: '⚫ Completed',     value: 'completed' },
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
      description: 'Add each stage (Group Stage, Survival Stage, Grand Finals, etc.)',
      of: [
        {
          type: 'object',
          name: 'stage',
          title: 'Stage',
          fields: [
            defineField({ name: 'name',           title: 'Stage Name',        type: 'string' }),
            defineField({
              name: 'status',
              title: 'Stage Status',
              type: 'string',
              options: {
                list: [
                  { title: 'Upcoming',  value: 'upcoming' },
                  { title: 'Live',      value: 'live' },
                  { title: 'Completed', value: 'completed' },
                ],
                layout: 'radio',
              },
              initialValue: 'upcoming',
            }),
            defineField({ name: 'startDate',      title: 'Start Date',        type: 'datetime' }),
            defineField({ name: 'endDate',        title: 'End Date',          type: 'datetime' }),
            defineField({ name: 'venue',          title: 'Venue',             type: 'string' }),
            defineField({ name: 'format',         title: 'Format',            type: 'string' }),
            defineField({ name: 'totalTeams',     title: 'Teams in Stage',    type: 'number' }),
            defineField({ name: 'teamsAdvancing', title: 'Teams Advancing',   type: 'number' }),
            defineField({ name: 'notes',          title: 'Notes',             type: 'text', rows: 2 }),
          ],
          preview: { select: { title: 'name', subtitle: 'status' } },
        },
      ],
    }),

    // ── Details ───────────────────────────────────────────────
    defineField({ name: 'editionBanner', title: 'Edition Banner', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'startDate',    title: 'Start Date (Overall)', type: 'datetime' }),
    defineField({ name: 'endDate',      title: 'End Date (Overall)',   type: 'datetime' }),
    defineField({ name: 'venue',        title: 'Venue / City',         type: 'string' }),
    defineField({
      name: 'format',
      title: 'Format',
      type: 'string',
      options: { list: ['Online', 'LAN', 'Hybrid'], layout: 'radio' },
    }),
    defineField({ name: 'totalTeams', title: 'Total Teams', type: 'number' }),

    // ── Prize Pool (structured) ───────────────────────────────
    defineField({
      name: 'totalPrizePool',
      title: 'Total Prize Pool',
      type: 'number',
      description: 'Numeric value only. e.g. 21000000 for ₹2.1 Cr, 3050000 for $3,050,000',
      group: 'prizePool',
    }),
    defineField({
      name: 'prizePoolCurrency',
      title: 'Currency',
      type: 'string',
      options: {
        list: [
          { title: 'INR ₹', value: 'INR' },
          { title: 'USD $', value: 'USD' },
          { title: 'EUR €', value: 'EUR' },
          { title: 'GBP £', value: 'GBP' },
          { title: 'SGD S$', value: 'SGD' },
          { title: 'AED',   value: 'AED' },
          { title: 'SAR',   value: 'SAR' },
        ],
        layout: 'radio',
      },
      initialValue: 'INR',
      group: 'prizePool',
    }),
    defineField({
      name: 'prizePoolDisplay',
      title: 'Display String (override)',
      type: 'string',
      description: 'Human-readable override shown on site. e.g. "₹2.1 Crore" or "$3,025,000". If blank, auto-formatted from numeric value.',
      group: 'prizePool',
    }),
    defineField({
      name: 'prizePoolStages',
      title: 'Stage Prize Pools',
      type: 'array',
      description: 'Per-stage breakdown — Group Stage, Survival Stage, Grand Finals, Bonuses, etc.',
      group: 'prizePool',
      of: [
        {
          type: 'object',
          name: 'prizeStage',
          title: 'Stage Pool',
          fields: [
            defineField({ name: 'stageName',     title: 'Stage Name',   type: 'string',  validation: (Rule) => Rule.required() }),
            defineField({ name: 'stagePool',     title: 'Pool Amount',  type: 'number' }),
            defineField({
              name: 'stageCurrency',
              title: 'Currency',
              type: 'string',
              options: {
                list: [
                  { title: 'INR ₹', value: 'INR' },
                  { title: 'USD $', value: 'USD' },
                  { title: 'EUR €', value: 'EUR' },
                  { title: 'GBP £', value: 'GBP' },
                ],
                layout: 'radio',
              },
            }),
            defineField({ name: 'stageNotes', title: 'Notes', type: 'string' }),
          ],
          preview: {
            select: { title: 'stageName', amount: 'stagePool', currency: 'stageCurrency' },
            prepare({ title, amount, currency }: Record<string, unknown>) {
              const sym = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '₹'
              const val = typeof amount === 'number' ? `${sym}${(amount as number).toLocaleString()}` : '—'
              return { title: String(title ?? 'Stage'), subtitle: val }
            },
          },
        },
      ],
    }),
    defineField({
      name: 'prizePlacements',
      title: 'Prize by Placement',
      type: 'array',
      description: '1st, 2nd, 3rd … MVP, Best IGL, etc.',
      group: 'prizePool',
      of: [
        {
          type: 'object',
          name: 'prizePlacement',
          title: 'Placement',
          fields: [
            defineField({ name: 'placement', title: 'Place',        type: 'string', description: 'e.g. 1st, 2nd, 3rd–4th, MVP', validation: (Rule) => Rule.required() }),
            defineField({ name: 'prize',     title: 'Prize Amount', type: 'number' }),
            defineField({
              name: 'currency',
              title: 'Currency',
              type: 'string',
              options: {
                list: [
                  { title: 'INR ₹', value: 'INR' },
                  { title: 'USD $', value: 'USD' },
                  { title: 'EUR €', value: 'EUR' },
                  { title: 'GBP £', value: 'GBP' },
                ],
                layout: 'radio',
              },
            }),
            defineField({ name: 'team',  title: 'Team',  type: 'reference', to: [{ type: 'team' }] }),
            defineField({ name: 'notes', title: 'Notes', type: 'string' }),
          ],
          preview: {
            select: { placement: 'placement', prize: 'prize', currency: 'currency', teamName: 'team.name' },
            prepare({ placement, prize, currency, teamName }: Record<string, unknown>) {
              const sym = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '₹'
              const val = typeof prize === 'number' ? `${sym}${(prize as number).toLocaleString()}` : '—'
              return {
                title: String(placement ?? '—'),
                subtitle: [val, teamName].filter(Boolean).join(' · '),
              }
            },
          },
        },
      ],
    }),

    // ── External Links ────────────────────────────────────────
    defineField({ name: 'liquipediaUrl', title: 'Liquipedia URL',   type: 'url' }),
    defineField({ name: 'officialUrl',   title: 'Official Website', type: 'url' }),
    defineField({ name: 'twitterUrl',    title: 'Twitter / X URL',  type: 'url' }),

    // ── Teams & Results ───────────────────────────────────────
    defineField({
      name: 'participants',
      title: 'Participants',
      type: 'array',
      description: 'Rich participant list with seeding, group, and invite source.',
      of: [{ type: 'editionParticipant' }],
    }),
    defineField({
      name: 'teams',
      title: 'Participating Teams (Legacy)',
      description: 'Legacy simple list. Prefer participants[] for all new editions.',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'team' }] }],
    }),
    defineField({ name: 'winner',   title: 'Winner',    type: 'reference', to: [{ type: 'team' }] }),
    defineField({ name: 'runnerUp', title: 'Runner Up', type: 'reference', to: [{ type: 'team' }] }),
    defineField({ name: 'mvp',      title: 'MVP',       type: 'reference', to: [{ type: 'player' }] }),

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
            defineField({ name: 'url',      title: 'URL',      type: 'url' }),
          ],
        },
      ],
    }),

    // ── Publish ───────────────────────────────────────────────
    defineField({
      name: 'publishStatus',
      title: 'Publish Status',
      type: 'string',
      options: { list: ['draft', 'review', 'published'], layout: 'radio' },
      initialValue: 'draft',
    }),
    defineField({ name: 'description', title: 'Description', type: 'text', rows: 4 }),
  ],

  preview: {
    select: {
      tournamentName: 'tournament.name',
      year: 'year',
      status: 'tournamentStatus',
      media: 'tournament.logo',
    },
    prepare({ tournamentName, year, status, media }) {
      const statusIcon: Record<string, string> = {
        upcoming: '🔵', group_stage: '🟢', survival_stage: '🟡', grand_finals: '🔴', completed: '⚫',
      }
      const icon = typeof status === 'string' ? (statusIcon[status] ?? '') : ''
      return {
        title: `${icon} ${tournamentName ?? ''} — ${year ?? ''}`.trim() || 'Untitled Edition',
        media: media as ReactNode,
      }
    },
  },
})
