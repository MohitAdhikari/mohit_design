import { defineType, defineField } from 'sanity'

export const subCategory = defineType({
  name: 'subCategory',
  title: 'Sub Category',
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
      options: { source: 'title' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'parent',
      title: 'Parent Category',
      type: 'reference',
      to: [{ type: 'category' }],
      description: 'The main category this sub-category belongs to (e.g. Roblox).',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 2,
    }),
  ],
  preview: {
    select: { title: 'title', parent: 'parent.title' },
    prepare({ title, parent }) {
      return {
        title: title || 'Sub Category',
        subtitle: parent ? `Under ${parent}` : 'No parent category',
      }
    },
  },
})
