import { defineType, defineField, defineArrayMember } from 'sanity'

export const scheduleBlock = defineType({
  name: 'scheduleBlock',
  title: 'Tournament Schedule',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      initialValue: 'Tournament Schedule',
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
      name: 'style',
      title: 'Box Style',
      type: 'string',
      initialValue: 'premium',
      options: {
        list: [
          { title: 'Premium', value: 'premium' },
          { title: 'Minimal', value: 'minimal' },
          { title: 'Plain', value: 'plain' },
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
    defineField({
      name: 'days',
      title: 'Schedule Days',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'scheduleDay',
          title: 'Day',
          fields: [
            defineField({ name: 'label', title: 'Day Label', type: 'string', description: 'e.g. "Day 1" or "Grand Finals"' }),
            defineField({ name: 'date', title: 'Date', type: 'datetime' }),
            defineField({
              name: 'matches',
              title: 'Matches / Fixtures',
              type: 'array',
              of: [
                defineArrayMember({
                  type: 'object',
                  name: 'scheduleMatch',
                  title: 'Match',
                  fields: [
                    defineField({ name: 'time', title: 'Time', type: 'datetime' }),
                    defineField({ name: 'teamA', title: 'Team / Player A', type: 'string' }),
                    defineField({ name: 'teamB', title: 'Team / Player B', type: 'string' }),
                    defineField({ name: 'stage', title: 'Stage / Round', type: 'string' }),
                    defineField({ name: 'description', title: 'Extra Info', type: 'string' }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
  ],
  preview: {
    select: { title: 'title', days: 'days' },
    prepare({ title, days }) {
      return {
        title: title || 'Schedule',
        subtitle: `${(days || []).length} day(s)`,
      }
    },
  },
})
