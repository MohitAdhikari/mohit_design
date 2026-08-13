import { defineType, defineField } from 'sanity'

export const tableBlock = defineType({
  name: 'tableBlock',
  title: 'Table',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Table Title',
      type: 'string',
      description: 'Optional heading shown above the table.',
    }),
    defineField({
      name: 'hideTitle',
      title: 'Hide Title',
      type: 'boolean',
      description: 'Enable if you are using a heading above this block manually.',
      initialValue: false,
    }),
    defineField({
      name: 'rawText',
      title: 'Paste Table Here',
      type: 'text',
      description: 'Paste pipe-separated ( | ) or tab-separated table. First line = header.',
      rows: 12,
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { title: 'title', rawText: 'rawText' },
    prepare({ title, rawText }: { title?: string; rawText?: string }) {
      const firstLine = rawText?.split('\n')[0]?.trim() || ''
      return { title: title || 'Table', subtitle: firstLine.slice(0, 60) }
    },
  },
})
