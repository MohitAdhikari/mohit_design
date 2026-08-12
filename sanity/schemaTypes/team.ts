import { defineType, defineField } from 'sanity'

export const team = defineType({
  name: 'team',
  title: 'Team',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Team Name',
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
      name: 'game',
      title: 'Game',
      type: 'string',
      options: {
        list: ['PUBG Mobile', 'BGMI', 'Valorant', 'Free Fire', 'Call of Duty Mobile', 'Mobile Legends', 'Multi-title', 'Other'],
        layout: 'dropdown',
      },
    }),
    defineField({
      name: 'country',
      title: 'Country',
      type: 'string',
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
      name: 'youtubeUrl',
      title: 'YouTube Channel URL',
      type: 'url',
    }),
    defineField({
      name: 'active',
      title: 'Active',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'country', media: 'logo' },
  },
})
