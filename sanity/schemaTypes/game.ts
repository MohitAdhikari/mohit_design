import { defineType, defineField } from 'sanity'

/**
 * Game / title. Feeds every "Game" dropdown in the Studio (tournaments,
 * teams, guides) and the homepage games marquee. Built-in games from
 * lib/games.ts are always available — create a doc here only to add a new
 * title (e.g. GTA 6) or to customise aliases / marquee visibility.
 */
export const game = defineType({
  name: 'game',
  title: 'Game',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Game Name',
      type: 'string',
      description: 'Exactly as it should appear on the site, e.g. "Free Fire MAX", "GTA 6".',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name', maxLength: 64 },
    }),
    defineField({
      name: 'aliases',
      title: 'Other Spellings',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
      description: 'Other names articles use for this game, e.g. "Free Fire", "FF MAX". Used to count articles for the homepage marquee order.',
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'showInMarquee',
      title: 'Show in Homepage Games Bar',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: { title: 'name', media: 'logo', show: 'showInMarquee' },
    prepare({ title, media, show }) {
      return { title, media, subtitle: show === false ? 'Hidden from games bar' : 'In games bar' }
    },
  },
})
