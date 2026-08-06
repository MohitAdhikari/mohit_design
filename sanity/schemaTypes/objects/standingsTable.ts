import { defineType, defineField } from 'sanity'

export const standingsTable = defineType({
  name: 'standingsTable',
  title: 'Standings Table',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Table Title',
      type: 'string',
      description: 'e.g. Group A Standings — Match 6 of 12',
    }),
    defineField({
      name: 'rawText',
      title: 'Paste Table Here',
      type: 'text',
      description: 'Paste pipe-separated ( | ) or tab-separated table. First line = header.',
      rows: 12,
    }),
  ],
  preview: {
    select: { title: 'title' },
    prepare({ title }: { title?: string }) {
      return { title: title || 'Standings Table' }
    },
  },
})
