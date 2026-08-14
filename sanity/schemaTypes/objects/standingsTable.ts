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
    }),
    defineField({
      name: 'displayStyle',
      title: 'Mobile Display Style',
      type: 'string',
      description:
        'Controls how this table looks on phones. "Auto-detect" guesses from column headers (Rank/Team = standings look). Force a style if it guesses wrong — e.g. a Match/Map/Time schedule should use "Generic".',
      options: {
        list: [
          { title: 'Auto-detect (default)', value: 'auto' },
          { title: 'Standings (rank medal + team name)', value: 'standings' },
          { title: 'Generic (first column as title + chips)', value: 'generic' },
        ],
        layout: 'radio',
      },
      initialValue: 'auto',
    }),
  ],
  preview: {
    select: { title: 'title' },
    prepare({ title }: { title?: string }) {
      return { title: title || 'Standings Table' }
    },
  },
})
