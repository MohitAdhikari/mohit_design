import { defineType, defineField } from 'sanity'

export const article = defineType({
  name: 'article',
  title: 'Article',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required().max(120) }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title', maxLength: 120 }, validation: (Rule) => Rule.required() }),
    defineField({
      name: 'type',
      title: 'Article Type',
      type: 'string',
      options: {
        list: [
          { title: '📰 News', value: 'news' },
          { title: '🔍 Match Preview', value: 'preview' },
          { title: '📋 Match Recap', value: 'recap' },
          { title: '📊 Standings Update', value: 'standings' },
          { title: '📈 Analysis', value: 'analysis' },
          { title: '🏆 Tournament Report', value: 'tournament_report' },
          { title: '🔄 Roster Move', value: 'roster_move' },
          { title: '📖 Guide', value: 'guide' },
        ],
        layout: 'radio',
      },
      initialValue: 'news',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Publish Status',
      type: 'string',
      options: {
        list: [
          { title: '📝 Draft', value: 'draft' },
          { title: '👀 Review', value: 'review' },
          { title: '✅ Published', value: 'published' },
        ],
        layout: 'radio',
      },
      initialValue: 'draft',
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'publishedAt', title: 'Published At', type: 'datetime' }),
    defineField({ name: 'author', title: 'Author', type: 'reference', to: [{ type: 'author' }] }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alt Text', type: 'string' })],
    }),
    defineField({ name: 'excerpt', title: 'Excerpt', type: 'text', rows: 3, validation: (Rule) => Rule.max(160) }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [
        { type: 'block' },
        { type: 'image', options: { hotspot: true }, fields: [defineField({ name: 'alt', type: 'string', title: 'Alt Text' }), defineField({ name: 'caption', type: 'string', title: 'Caption' })] },
        { type: 'calloutBox' },
        { type: 'videoEmbedBlock' },
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'tournament', title: 'Tournament', type: 'reference', to: [{ type: 'tournament' }] }),
    defineField({ name: 'edition', title: 'Tournament Edition', type: 'reference', to: [{ type: 'tournamentEdition' }] }),
    defineField({ name: 'relatedMatches', title: 'Related Matches', type: 'array', of: [{ type: 'reference', to: [{ type: 'match' }] }] }),
    defineField({ name: 'relatedTeams', title: 'Related Teams', type: 'array', of: [{ type: 'reference', to: [{ type: 'team' }] }] }),
    defineField({ name: 'relatedPlayers', title: 'Related Players', type: 'array', of: [{ type: 'reference', to: [{ type: 'player' }] }] }),
    defineField({ name: 'tags', title: 'Tags', type: 'array', of: [{ type: 'reference', to: [{ type: 'tag' }] }] }),
    defineField({ name: 'category', title: 'Category', type: 'reference', to: [{ type: 'category' }] }),
    defineField({ name: 'seo', title: 'SEO', type: 'seo' }),
  ],
  preview: {
    select: { title: 'title', type: 'type', status: 'status', media: 'coverImage', publishedAt: 'publishedAt' },
    prepare({ title, type, status, media, publishedAt }) {
      const statusIcon = status === 'published' ? '✅' : status === 'review' ? '👀' : '📝'
      const date = publishedAt ? new Date(publishedAt).toLocaleDateString('en-IN') : 'No date'
      return { title, subtitle: `${statusIcon} ${status?.toUpperCase()} · ${type} · ${date}`, media }
    },
  },
  orderings: [{ title: 'Published (newest)', name: 'publishedAtDesc', by: [{ field: 'publishedAt', direction: 'desc' }] }],
})
