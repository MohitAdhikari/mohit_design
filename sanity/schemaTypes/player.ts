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
    defineField({
      name: 'realName',
      title: 'Real Name',
      type: 'string',
    }),
    defineField({
      name: 'photo',
      title: 'Photo',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'team',
      title: 'Current Team',
      type: 'reference',
      to: [{ type: 'team' }],
    }),
    defineField({
      name: 'role',
      title: 'Role',
      type: 'string',
      options: {
        list: ['IGL', 'Fragger', 'Support', 'Sniper', 'All-rounder', 'Substitute', 'Coach', 'Analyst'],
        layout: 'dropdown',
      },
    }),
    defineField({
      name: 'country',
      title: 'Country',
      type: 'string',
    }),
    defineField({
      name: 'nationality',
      title: 'Nationality (for flag)',
      type: 'string',
      description: 'ISO 3166-1 alpha-2 code — e.g. IN, KR, US, SA',
    }),
    defineField({
      name: 'liquipediaUrl',
      title: 'Liquipedia URL',
      type: 'url',
    }),
    defineField({
      name: 'twitterUrl',
      title: 'Twitter / X URL',
      type: 'url',
    }),
    defineField({
      name: 'instagramUrl',
      title: 'Instagram URL',
      type: 'url',
    }),
    defineField({
      name: 'active',
      title: 'Active',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: { title: 'ign', subtitle: 'realName', media: 'photo' },
  },
})
