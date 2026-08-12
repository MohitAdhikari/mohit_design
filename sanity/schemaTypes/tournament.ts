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
      name: 'game',
      title: 'Game',
      type: 'string',
      options: {
        list: ['PUBG Mobile', 'BGMI', 'Valorant', 'Free Fire', 'Call of Duty Mobile', 'Mobile Legends', 'Other'],
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
    }),
    defineField({
      name: 'banner',
      title: 'Banner',
      type: 'image',
      options: { hotspot: true },
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
    select: { title: 'name', subtitle: 'game', media: 'logo' },
  },
})
