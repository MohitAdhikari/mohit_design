// sanity/schemaTypes/tournamentEdition.ts
import { type ReactNode } from 'react'
import { defineType, defineField } from 'sanity'

export const tournamentEdition = defineType({
  name: 'tournamentEdition',
  title: 'Tournament Editions',
  type: 'document',
  fields: [
    defineField({
      name: 'tournament',
      title: 'Tournament (Series)',
      type: 'reference',
      to: [{ type: 'tournament' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'year',
      title: 'Year',
      type: 'string',
      description: 'e.g. 2026, Season 5',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: (doc: Record<string, unknown>) => {
          const year = typeof doc.year === 'string' ? doc.year : ''
          return year
        },
        maxLength: 96,
      },
    }),
    defineField({
      name: 'editionBanner',
      title: 'Edition Banner',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({ name: 'startDate', title: 'Start Date', type: 'datetime' }),
    defineField({ name: 'endDate', title: 'End Date', type: 'datetime' }),
    defineField({ name: 'venue', title: 'Venue / Location', type: 'string' }),
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
      description: 'e.g. ₹1,00,00,000',
    }),
    defineField({
      name: 'totalTeams',
      title: 'Total Teams',
      type: 'number',
    }),
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
    defineField({
      name: 'broadcastLinks',
      title: 'Broadcast Links',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'platform',
              title: 'Platform',
              type: 'string',
              description: 'e.g. YouTube, Loco',
            }),
            defineField({ name: 'url', title: 'URL', type: 'url' }),
          ],
        },
      ],
    }),
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
      media: 'tournament.logo',
    },
    prepare({ tournamentName, year, media }) {
      const name = typeof tournamentName === 'string' ? tournamentName : ''
      const yearValue = typeof year === 'string' ? year : ''
      const title = name && yearValue
        ? `${name} — ${yearValue}`
        : name || yearValue || 'Untitled Edition'

      return {
        title,
        media: media as ReactNode,
      }
    },
  },
})
