import { defineType, defineField } from 'sanity'

export const standingsTable = defineType({
  name: 'standingsTable',
  title: 'Standings Table',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Title (optional)',
      type: 'string',
      description: 'Shown above the table, e.g. "Group A Standings".',
    }),
    defineField({
      name: 'rawText',
      title: 'Table Data',
      type: 'text',
      rows: 10,
      validation: (Rule) => Rule.required(),
      description: 'Paste the table with a header row. Columns can be separated by | or tabs.',
    }),
  ],
  preview: {
    select: { title: 'title', rawText: 'rawText' },
    prepare({ title, rawText }: { title?: string; rawText?: string }) {
      const rows = rawText ? rawText.split('\n').filter((l) => l.trim()).length : 0
      return {
        title: title || 'Standings Table',
        subtitle: rows ? `${rows} row(s)` : 'No data',
      }
    },
  },
})
