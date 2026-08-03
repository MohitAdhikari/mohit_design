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
      name: 'titleLevel',
      title: 'Title Level',
      type: 'string',
      initialValue: 'h2',
      options: {
        list: [
          { title: 'H1', value: 'h1' },
          { title: 'H2', value: 'h2' },
          { title: 'H3', value: 'h3' },
          { title: 'H4', value: 'h4' },
          { title: 'H5', value: 'h5' },
          { title: 'H6', value: 'h6' },
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'items',
      title: 'Highlight Items',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'style',
      title: 'Box Style',
      type: 'string',
      initialValue: '',
      options: {
        list: [
          { title: 'Use site default', value: '' },
          { title: 'Premium', value: 'premium' },
          { title: 'Minimal', value: 'minimal' },
          { title: 'Plain', value: 'plain' },
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'bulletStyle',
      title: 'Bullet Style',
      type: 'string',
      initialValue: 'bullet',
      options: {
        list: [
          { title: 'Bullet', value: 'bullet' },
          { title: 'Numbered', value: 'number' },
          { title: 'Checkmark', value: 'check' },
          { title: 'None', value: 'none' },
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'desktopOnly',
      title: 'Show on Desktop Only',
      type: 'boolean',
      initialValue: false,
      description: 'Hide this block on mobile to keep the article clean.',
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
