import { createElement } from 'react'
import { defineType, defineField } from 'sanity'
import { GameSelectInput } from '../components/GameSelectInput'
import { TournamentSwatch } from '../components/TournamentSwatch'
import { TOURNAMENT_COLORS } from '../../lib/tournamentColors'

export const tournament = defineType({
  name: 'tournament',
  title: 'Tournament',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Tournament Name',
      type: 'string',
      description: 'You can rename the tournament any time — the slug (URL) only changes if you regenerate it below.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name', maxLength: 96 },
    }),
    defineField({
      name: 'game',
      title: 'Game',
      type: 'string',
      components: { input: GameSelectInput },
    }),
    defineField({
      name: 'accentColor',
      title: 'Accent Colour',
      type: 'string',
      description:
        'Helps tell similar tournaments apart in the Studio and on the site. Leave empty to auto-pick a stable colour from the name.',
      options: {
        list: TOURNAMENT_COLORS.map((c) => ({ title: c.title, value: c.value })),
        layout: 'dropdown',
      },
    }),
    defineField({
      name: 'region',
      title: 'Region',
      type: 'string',
      options: {
        list: ['Global', 'South Asia', 'India', 'Southeast Asia', 'Middle East', 'Europe', 'North America', 'Korea', 'Other'],
        layout: 'dropdown',
      },
    }),
    defineField({
      name: 'organizer',
      title: 'Organizer',
      type: 'string',
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      options: { hotspot: true },
      description: 'PNG with transparent background works best. Also used as the banner when no banner image is uploaded.',
    }),
    defineField({
      name: 'banner',
      title: 'Banner',
      type: 'image',
      options: { hotspot: true },
      description: 'Wide image for the tournament page header (recommended 1920×600). Optional — the logo is shown instead if empty.',
    }),
    defineField({
      name: 'liquipediaUrl',
      title: 'Liquipedia URL',
      type: 'url',
    }),
    defineField({
      name: 'officialUrl',
      title: 'Official Website',
      type: 'url',
    }),
    defineField({
      name: 'twitterUrl',
      title: 'Twitter / X URL',
      type: 'url',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
    }),
  ],
  preview: {
    select: { title: 'name', game: 'game', media: 'logo', color: 'accentColor' },
    prepare({ title, game, media, color }) {
      return {
        title,
        subtitle: game,
        media: media ?? createElement(TournamentSwatch, { name: title, color }),
      }
    },
  },
})
