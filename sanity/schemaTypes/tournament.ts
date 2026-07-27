import { defineType, defineField } from 'sanity'

export const tournament = defineType({
  name: 'tournament',
  title: 'Tournament',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Tournament Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name', maxLength: 96 },
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'banner',
      title: 'Banner',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({ name: 'organizer', title: 'Organizer', type: 'string' }),
    defineField({ name: 'prizePool', title: 'Prize Pool', type: 'string' }),
    defineField({ name: 'venue', title: 'Venue', type: 'string' }),
    defineField({ name: 'startDate', title: 'Start Date', type: 'datetime' }),
    defineField({ name: 'endDate', title: 'End Date', type: 'datetime' }),
    defineField({ name: 'description', title: 'Description', type: 'text', rows: 4 }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'organizer', media: 'logo' },
  },
})
