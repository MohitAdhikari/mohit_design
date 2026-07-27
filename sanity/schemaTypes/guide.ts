import { defineType, defineField } from 'sanity'

export const guide = defineType({
  name: 'guide',
  title: 'Guide / Code',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'gameName',
      title: 'Game Name',
      type: 'string',
      description: 'e.g., BGMI, Roblox, etc.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'thumbnail',
      title: 'Thumbnail Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'youtubeUrl',
      title: 'YouTube video URL',
      type: 'url',
    }),
    defineField({
      name: 'instagramUrl',
      title: 'Instagram Post URL',
      type: 'url',
      description: 'Used to embed an Instagram post. Youtube URL takes priority if both are provided.',
    }),
    defineField({
      name: 'codesList',
      title: 'Codes List',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'List of active codes for this game/guide.',
    }),
    defineField({
      name: 'content',
      title: 'Guide Content',
      type: 'array',
      of: [{ type: 'block' }, { type: 'image' }],
    }),
    defineField({
      name: 'lastUpdated',
      title: 'Last Updated',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'guideType',
      title: 'Guide Type',
      type: 'string',
      options: {
        list: [
          { title: 'Redeem Codes', value: 'codes' },
          { title: 'How-To / Tutorial', value: 'tutorial' },
          { title: 'Tier List', value: 'tier_list' },
          { title: 'Walkthrough', value: 'walkthrough' },
          { title: 'Tips & Tricks', value: 'tips' },
        ],
      },
    }),
    defineField({
      name: 'lastVerifiedDate',
      title: 'Last Verified Date',
      type: 'datetime',
      description: 'When the codes / instructions in this guide were last confirmed working.',
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'tag' }] }],
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo',
    }),
  ],
})
