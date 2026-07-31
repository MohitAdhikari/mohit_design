import { defineType, defineField, defineArrayMember } from 'sanity'

export const highlightsBlock = defineType({
  name: 'highlightsBlock',
  title: 'Highlights Block',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      initialValue: 'Highlights',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'items',
      title: 'Highlight Items',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      validation: (Rule) => Rule.required().min(1),
    }),
  ],
  preview: {
    select: { title: 'title', items: 'items' },
    prepare({ title, items }) {
      return {
        title: title || 'Highlights',
        subtitle: `${(items || []).length} item(s)`,
      }
    },
  },
})
