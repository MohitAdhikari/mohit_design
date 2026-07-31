import { defineType, defineField } from 'sanity'
import { TagTitleInput } from '../components/TagTitleInput'

export const tag = defineType({
  name: 'tag',
  title: 'Tag',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
      components: { input: TagTitleInput },
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) =>
        Rule.required().custom(async (slug, context) => {
          if (!slug?.current) return true

          const { document, getClient } = context
          const client = getClient({ apiVersion: '2023-01-01' })
          const docId = document?._id ? document._id.replace(/^drafts\./, '') : ''

          const existing = await client.fetch(
            `*[_type == "tag" && slug.current == $slug && _id != $docId && _id != "drafts." + $docId][0]{_id, title}`,
            { slug: slug.current, docId }
          )

          if (existing) {
            return {
              message: `This slug is already used by the tag “${existing.title}”. Each tag must have a unique slug.`,
            }
          }
          return true
        }),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      description: 'Optional short description shown on tag archive pages.',
    }),
    defineField({
      name: 'seo',
      title: 'SEO & Social Sharing',
      type: 'object',
      description: 'Future-proof metadata for tag archive pages.',
      fields: [
        defineField({
          name: 'seoTitle',
          title: 'SEO Title',
          type: 'string',
          description: 'Override the default archive page title.',
        }),
        defineField({
          name: 'metaDescription',
          title: 'Meta Description',
          type: 'text',
          rows: 2,
        }),
        defineField({
          name: 'openGraphImage',
          title: 'Open Graph Image',
          type: 'image',
          options: { hotspot: true },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'slug.current' },
  },
})
