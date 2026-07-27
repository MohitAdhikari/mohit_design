import { defineType, defineField } from 'sanity'

export const seo = defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({
      name: 'seoTitle',
      title: 'SEO Title',
      type: 'string',
      description: 'Recommended 50–60 characters. Falls back to the post title if empty.',
      validation: (Rule) =>
        Rule.max(70).warning('Keep SEO titles under ~60 characters for best results.'),
    }),
    defineField({
      name: 'metaDescription',
      title: 'Meta Description',
      type: 'text',
      rows: 3,
      description: 'Max 160 characters. Falls back to the excerpt/body if empty.',
      validation: (Rule) =>
        Rule.max(160).warning('Meta descriptions should be 160 characters or fewer.'),
    }),
    defineField({
      name: 'focusKeyword',
      title: 'Focus Keyword',
      type: 'string',
    }),
    defineField({
      name: 'canonicalUrl',
      title: 'Canonical URL',
      type: 'url',
      description: 'Only set this if this content is a duplicate of another canonical page.',
    }),
    defineField({
      name: 'socialShareImage',
      title: 'Social Share Image',
      type: 'image',
      description: 'Used for Open Graph / Twitter cards. Falls back to the featured image.',
      options: { hotspot: true },
    }),
  ],
})
