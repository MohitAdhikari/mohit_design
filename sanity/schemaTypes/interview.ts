import { defineType, defineField } from 'sanity'
import { TagsInput } from '../components/TagsInput'

export const interview = defineType({
  name: 'interview',
  title: 'Interview',
  type: 'document',
  fields: [
    defineField({
      name: 'playerOrCeoName',
      title: 'Player / CEO Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'eventName',
      title: 'Event Name (LAN / Online)',
      type: 'string',
    }),
    defineField({
      name: 'thumbnail',
      title: 'Thumbnail Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'thumbnailAlt',
      title: 'Thumbnail Alt Text',
      type: 'string',
      description: 'Describe the image for accessibility & SEO. Required.',
      validation: (Rule) => Rule.required().error('Alt text is required for the thumbnail image.'),
    }),
    defineField({
      name: 'thumbnailCaption',
      title: 'Thumbnail Caption',
      type: 'string',
    }),
    defineField({
      name: 'thumbnailCredit',
      title: 'Thumbnail Credit',
      type: 'string',
      description: 'Optional attribution, e.g. "Photo: Riot Games".',
    }),
    defineField({
      name: 'youtubeUrl',
      title: 'YouTube Video URL',
      type: 'url',
    }),
    defineField({
      name: 'instagramUrl',
      title: 'Instagram Post URL',
      type: 'url',
      description: 'Used to embed an Instagram post. Youtube URL takes priority if both are provided.',
    }),
    defineField({
      name: 'keyHighlights',
      title: 'Key Highlights',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'publishDate',
      title: 'Publish Date',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'showOnHomepage',
      title: 'Show on Homepage',
      type: 'boolean',
      initialValue: true,
      description: 'Include this interview on the homepage (feed, trending, hero and Interviews section).',
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
      description: 'Prioritize this interview for the homepage Hero rotation, ahead of pure recency. Same as the "Featured" toggle on News Posts.',
    }),
    defineField({
      name: 'trending',
      title: 'Trending',
      type: 'boolean',
      initialValue: false,
      description: 'Prioritize this interview in the homepage "Trending Now" section, ahead of pure recency.',
    }),
    defineField({
      name: 'categoryRef',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'category' }],
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'tag' }] }],
      components: { input: TagsInput },
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo',
    }),
  ],
})
