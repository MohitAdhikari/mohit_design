import { defineType, defineField } from 'sanity'
import { ReadingTimeInput } from '../components/ReadingTimeInput'

export const newsPost = defineType({
  name: 'newsPost',
  title: 'News Post',
  type: 'document',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'media', title: 'Media' },
    { name: 'relations', title: 'Relations' },
    { name: 'publishing', title: 'Publishing' },
    { name: 'seo', title: 'SEO' },
    { name: 'advanced', title: 'Advanced' },
  ],
  fields: [
    // ---- CONTENT ----
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'content',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'content',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
      group: 'content',
      description: 'Short summary shown in listings and used as a meta description fallback.',
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      group: 'content',
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
      ],
    }),

    // ---- MEDIA ----
    defineField({
      name: 'thumbnail',
      title: 'Featured Image',
      type: 'image',
      group: 'media',
      options: { hotspot: true },
    }),
    defineField({
      name: 'imageAlt',
      title: 'Featured Image Alt Text',
      type: 'string',
      group: 'media',
      description: 'Describe the image for accessibility & SEO. Required.',
      validation: (Rule) => Rule.required().error('Alt text is required for the featured image.'),
    }),
    defineField({
      name: 'imageCaption',
      title: 'Image Caption',
      type: 'string',
      group: 'media',
    }),
    defineField({
      name: 'imageCredit',
      title: 'Image Credit',
      type: 'string',
      group: 'media',
      description: 'Optional attribution, e.g. "Photo: Riot Games".',
    }),
    defineField({
      name: 'youtubeUrl',
      title: 'YouTube URL',
      type: 'url',
      group: 'media',
    }),
    defineField({
      name: 'instagramUrl',
      title: 'Instagram Post URL',
      type: 'url',
      group: 'media',
      description: 'Used to embed an Instagram post. Youtube URL takes priority if both are provided.',
    }),

    // ---- RELATIONS ----
    defineField({
      name: 'category',
      title: 'Category (legacy label)',
      type: 'string',
      group: 'relations',
      description: 'Existing text category used by the current site. Kept for backward compatibility.',
      options: {
        list: [
          { title: 'BGMI News', value: 'BGMI News' },
          { title: 'Tournament', value: 'Tournament' },
          { title: 'Roster Changes', value: 'Roster Changes' },
          { title: 'Leaks', value: 'Leaks' },
          { title: 'Press Release', value: 'Press Release' },
          { title: 'Esports', value: 'Esports' },
          { title: 'Mobile Gaming', value: 'Mobile Gaming' },
          { title: 'Update', value: 'Update' },
          { title: 'Feature', value: 'Feature' },
          { title: 'Opinion', value: 'Opinion' },
          { title: 'Review', value: 'Review' },
          { title: 'Other', value: 'Other' },
        ],
      },
    }),
    defineField({
      name: 'categoryRef',
      title: 'Category',
      type: 'reference',
      group: 'relations',
      to: [{ type: 'category' }],
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      group: 'relations',
      to: [{ type: 'author' }],
    }),
    defineField({
      name: 'authorName',
      title: 'Author Name (legacy)',
      type: 'string',
      group: 'relations',
      description: 'Existing text author used by the current site. Kept for backward compatibility.',
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      group: 'relations',
      of: [{ type: 'reference', to: [{ type: 'tag' }] }],
    }),
    defineField({
      name: 'tournament',
      title: 'Tournament',
      type: 'reference',
      group: 'relations',
      to: [{ type: 'tournament' }],
    }),
    defineField({
      name: 'teams',
      title: 'Teams',
      type: 'array',
      group: 'relations',
      of: [{ type: 'reference', to: [{ type: 'team' }] }],
    }),
    defineField({
      name: 'players',
      title: 'Players',
      type: 'array',
      group: 'relations',
      of: [{ type: 'reference', to: [{ type: 'player' }] }],
    }),

    // ---- PUBLISHING ----
    defineField({
      name: 'publishDate',
      title: 'Published At',
      type: 'datetime',
      group: 'publishing',
      description: 'The official publication date/time shown on the site. Defaults to now — can be backdated or scheduled in the future.',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'updatedAt',
      title: 'Updated At',
      type: 'datetime',
      group: 'publishing',
      description: 'Only shown on the site when "Show Updated Date" is enabled below. Leave empty to hide.',
      validation: (Rule) =>
        Rule.custom((updatedAt, context) => {
          if (!updatedAt) return true;
          const doc = context.document as any;
          const published = doc?.publishDate;
          if (!published) return true;
          if (new Date(updatedAt as string) < new Date(published)) {
            return 'Updated At cannot be earlier than Published At.';
          }
          return true;
        }),
    }),
    defineField({
      name: 'showUpdatedDate',
      title: 'Show Updated Date',
      type: 'boolean',
      group: 'publishing',
      initialValue: false,
      description: 'Enable to display "Updated {date}" on the article. Intended for guides, redeem codes, live blogs, and evergreen content — most regular news should leave this off.',
    }),
    defineField({
      name: 'estimatedReadTime',
      title: 'Estimated Read Time',
      type: 'string',
      group: 'publishing',
      readOnly: true,
      description: 'Automatically calculated from the article content. Internal editorial reference only — never shown to readers.',
      components: { input: ReadingTimeInput },
    }),
    defineField({
      name: 'featured',
      title: 'Featured Article',
      type: 'boolean',
      group: 'publishing',
      initialValue: false,
    }),
    defineField({
      name: 'breakingNews',
      title: 'Breaking News',
      type: 'boolean',
      group: 'publishing',
      initialValue: false,
    }),
    defineField({
      name: 'trending',
      title: 'Trending',
      type: 'boolean',
      group: 'publishing',
      initialValue: false,
    }),

    // ---- SEO ----
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo',
      group: 'seo',
    }),

    // ---- ADVANCED / EDITORIAL WORKFLOW ----
    defineField({
      name: 'status',
      title: 'Editorial Status',
      type: 'string',
      group: 'advanced',
      initialValue: 'draft',
      options: {
        list: [
          { title: 'Draft', value: 'draft' },
          { title: 'In Review', value: 'in_review' },
          { title: 'Changes Requested', value: 'changes_requested' },
          { title: 'Approved', value: 'approved' },
          { title: 'Scheduled', value: 'scheduled' },
          { title: 'Published', value: 'published' },
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'suggestedPublishDate',
      title: 'Suggested Publish Date (writer request)',
      type: 'datetime',
      group: 'advanced',
      description: 'A writer\'s preferred publish time. Only a suggestion — an editor decides the actual schedule.',
    }),
    defineField({
      name: 'reviewNotes',
      title: 'Editor Review Notes',
      type: 'text',
      rows: 3,
      group: 'advanced',
      description: 'Feedback from an editor when requesting changes or rejecting.',
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'status', media: 'thumbnail' },
  },
})
