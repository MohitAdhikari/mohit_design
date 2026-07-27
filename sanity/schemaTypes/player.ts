import { defineType, defineField } from 'sanity'

export const player = defineType({
  name: 'player',
  title: 'Player',
  type: 'document',
  fields: [
    defineField({
      name: 'ign',
      title: 'IGN (In-Game Name)',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'ign', maxLength: 96 },
    }),
    defineField({ name: 'realName', title: 'Real Name', type: 'string' }),
    defineField({
      name: 'photo',
      title: 'Photo',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'team',
      title: 'Team',
      type: 'reference',
      to: [{ type: 'team' }],
    }),
    defineField({ name: 'country', title: 'Country', type: 'string' }),
    defineField({ name: 'active', title: 'Active', type: 'boolean', initialValue: true }),
  ],
  preview: {
    select: { title: 'ign', subtitle: 'realName', media: 'photo' },
  },
})
