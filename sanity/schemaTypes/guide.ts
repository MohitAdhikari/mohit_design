import { defineType, defineField } from 'sanity'
import { ReadingTimeInput } from '../components/ReadingTimeInput'
import { TagsInput } from '../components/TagsInput'

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
      of: [
        { type: 'block' },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({
              name: 'alt',
              title: 'Alt Text',
              type: 'string',
              description: 'Required for accessibility and SEO.',
              validation: (Rule) => Rule.required(),
            }),
            defineField({ name: 'caption', title: 'Caption', type: 'string' }),
            defineField({ name: 'credit', title: 'Image Credit', type: 'string' }),
          ],
        },
        { type: 'highlightsBlock' },
        { type: 'calloutBox' },
      ],
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{ type: 'author' }],
    }),
    defineField({
      name: 'publishDate',
      title: 'Published At',
      type: 'datetime',
      description: 'The official publication date/time shown on the site. Defaults to now — can be backdated or scheduled in the future.',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'lastUpdated',
      title: 'Updated At',
      type: 'datetime',
      description: 'Shown on the site when "Show Updated Date" is enabled. Update this whenever codes/instructions change.',
      initialValue: () => new Date().toISOString(),
      validation: (Rule) =>
        Rule.custom((lastUpdated, context) => {
          if (!lastUpdated) return true;
          const doc = context.document as any;
          const published = doc?.publishDate;
          if (!published) return true;
          if (new Date(lastUpdated as string) < new Date(published)) {
            return 'Updated At cannot be earlier than Published At.';
          }
          return true;
        }),
    }),
    defineField({
      name: 'showUpdatedDate',
      title: 'Show Updated Date',
      type: 'boolean',
      initialValue: true,
      description: 'Guides and redeem codes typically benefit from showing when they were last verified/updated. Enabled by default for this content type.',
    }),
    defineField({
      name: 'estimatedReadTime',
      title: 'Estimated Read Time',
      type: 'string',
      readOnly: true,
      description: 'Automatically calculated from the guide content. Internal editorial reference only — never shown to readers.',
      components: { input: ReadingTimeInput },
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
      components: { input: TagsInput },
    }),
    defineField({
      name: 'useGlobalAppearance',
      title: 'Use Global Settings',
      type: 'boolean',
      initialValue: true,
      description: 'Use the site-wide Appearance settings. Turn off to override the Highlights style for this guide only.',
    }),
    defineField({
      name: 'customHighlightsStyle',
      title: 'Custom Highlights Style',
      type: 'string',
      options: {
        list: [
          { title: 'Premium', value: 'premium' },
          { title: 'Minimal', value: 'minimal' },
          { title: 'Plain', value: 'plain' },
        ],
        layout: 'radio',
      },
      hidden: ({ document }) => document?.useGlobalAppearance !== false,
      description: 'Only used when "Use Global Settings" is off.',
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo',
    }),
  ],
})
